import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useQuery } from "@tanstack/react-query"
import { default as React, useCallback, useMemo } from "react"
import { Image, Linking, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { B3TR, ColorThemeType, defaultMainNetwork, DIRECTIONS, VOT3 } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useWaitTransaction } from "~Hooks/useWaitTransaction/useWaitTransaction"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

type Props = {
    txId?: string
    amount?: string
    from?: FungibleToken
    to?: FungibleToken
    onClose: () => void
}

export const ConvertedBetterBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ txId, amount, from, to, onClose }: Props, ref) => {
        const { waitTransaction } = useWaitTransaction()

        const { data, isFetching } = useQuery({
            queryKey: ["TransactionReceipt", txId],
            queryFn: () => waitTransaction(txId!),
            enabled: Boolean(txId),
            retry: false,
        })

        const { LL } = useI18nContext()
        const theme = useTheme()
        const selectedNetwork = useAppSelector(selectSelectedNetwork)

        const onSeeDetailsPress = useCallback(async () => {
            await Linking.openURL(
                `${selectedNetwork.explorerUrl ?? defaultMainNetwork.explorerUrl}/transactions/${txId}`,
            )
        }, [selectedNetwork.explorerUrl, txId])

        const title = useMemo(() => {
            if (isFetching) return LL.BD_TOKEN_CONVERTED_LOADING()
            if (data === null) return LL.BD_TOKEN_CONVERTED_ERROR()
            return LL.BD_TOKEN_CONVERTED_SUCCESS()
        }, [LL, data, isFetching])

        return (
            <BaseBottomSheet ref={ref} blurBackdrop enablePanDownToClose dynamicHeight>
                <BaseView>
                    <BaseView alignItems="center" px={24}>
                        {isFetching ? (
                            <BaseIcon name="icon-check-circle" size={32} color={theme.colors.title} />
                        ) : (
                            <BaseIcon
                                name={data === null ? "icon-alert-triangle" : "icon-check-circle"}
                                size={32}
                                color={theme.colors.title}
                            />
                        )}

                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.title}>
                            {title}
                        </BaseText>
                        <BaseSpacer height={32} />
                    </BaseView>
                    <BaseView flexDirection="row" justifyContent="center" alignItems="center">
                        <ConvertionCard direction={DIRECTIONS.UP} token={from} amount={amount} />
                        <BaseView p={8}>
                            <BaseIcon name="icon-arrow-right" color={theme.colors.graphStatsText} />
                        </BaseView>
                        <ConvertionCard direction={DIRECTIONS.DOWN} token={to} amount={amount} />
                    </BaseView>

                    <BaseSpacer height={24} />

                    {txId && (
                        <>
                            <BaseText align="center" onPress={onSeeDetailsPress}>
                                {LL.BD_TRANSACTION_DETAILS()}{" "}
                                <BaseIcon name="icon-arrow-link" color={theme.colors.text} size={12} />
                            </BaseText>
                            <BaseSpacer height={24} />
                        </>
                    )}
                    <BaseButton action={onClose}>{LL.COMMON_BTN_OK()}</BaseButton>
                    <BaseSpacer height={20} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)

type ConvertionCardProps = {
    direction: DIRECTIONS
    token?: FungibleToken
    amount?: string
}

const ConvertionCard = ({ direction, token, amount }: ConvertionCardProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(cardBaseStyles)

    const renderIcon = useMemo(() => {
        if (token?.symbol === B3TR.symbol) return B3TR.icon
        if (token?.symbol === VOT3.symbol) return VOT3.icon

        return token?.icon
    }, [token?.icon, token?.symbol])

    return (
        <BaseView flex={1} style={[styles.container]}>
            <BaseText typographyFont="captionSemiBold" color={theme.colors.textLight}>
                {direction === DIRECTIONS.UP ? LL.FROM() : LL.TO()}
            </BaseText>

            <BaseView flexDirection="row" mb={2}>
                <Image source={{ uri: renderIcon }} width={24} height={24} />
                <BaseText pl={8} typographyFont="bodySemiBold" color={theme.colors.assetDetailsCard.title}>
                    {token?.symbol}
                </BaseText>
            </BaseView>

            <BaseText
                fontFamily="Inter-SemiBold"
                fontSize={20}
                fontWeight="600"
                color={theme.colors.assetDetailsCard.title}>
                {amount}
            </BaseText>
        </BaseView>
    )
}

const cardBaseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 16,
            gap: 10,
            overflow: "hidden",
        },
    })
