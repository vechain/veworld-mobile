import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback } from "react"
import { Image, Linking, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType, defaultMainNetwork, DIRECTIONS } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

type Props = {
    txId?: string
    amount?: string
    from?: FungibleTokenWithBalance
    to?: FungibleTokenWithBalance
    onClose: () => void
}

export const ConvertBetterTokenSuccessBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ txId, amount, from, to, onClose }, ref) => {
        const { LL } = useI18nContext()
        const theme = useTheme()
        const selectedNetwork = useAppSelector(selectSelectedNetwork)

        const onSeeDetailsPress = useCallback(async () => {
            await Linking.openURL(
                `${selectedNetwork.explorerUrl ?? defaultMainNetwork.explorerUrl}/transactions/${txId}`,
            )
        }, [selectedNetwork.explorerUrl, txId])

        return (
            <BaseBottomSheet ref={ref} blurBackdrop enablePanDownToClose dynamicHeight>
                <BaseView>
                    <BaseView alignItems="center" px={24}>
                        <BaseIcon name="icon-check-circle" size={32} color={theme.colors.title} />
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.title}>
                            {LL.BD_TOKEN_CONVERTED_SUCCESS()}
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
                </BaseView>
            </BaseBottomSheet>
        )
    },
)

type ConvertionCardProps = {
    direction: DIRECTIONS
    token?: FungibleTokenWithBalance
    amount?: string
}

const ConvertionCard: React.FC<ConvertionCardProps> = ({ direction, token, amount }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(cardBaseStyles)

    return (
        <BaseView flex={1} style={[styles.container]}>
            <BaseText typographyFont="captionSemiBold" color={theme.colors.textLight}>
                {direction === DIRECTIONS.UP ? LL.FROM() : LL.TO()}
            </BaseText>

            <BaseView flexDirection="row" mb={2}>
                <Image source={{ uri: token?.icon }} width={24} height={24} />
                <BaseText pl={8} typographyFont="bodySemiBold" color={theme.colors.assetDetailsCard.title}>
                    {token?.symbol}
                </BaseText>
            </BaseView>

            <BaseText typographyFont="subTitleSemiBold" color={theme.colors.assetDetailsCard.title}>
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
