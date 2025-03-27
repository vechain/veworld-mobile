import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { default as React, useCallback, useEffect, useMemo } from "react"
import { Image, Linking, StyleSheet } from "react-native"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { BaseIcon } from "~Components/Base/BaseIcon"
import { B3TR, ColorThemeType, defaultMainNetwork, DIRECTIONS, VOT3 } from "~Constants"
import { useTheme, useThemedStyles, useWaitTransaction } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

type Props = {
    txId?: string
    amount?: string
    from?: FungibleToken
    to?: FungibleToken
    onClose: () => void
    onFailure: () => void
}

const AnimatedIcon = Animated.createAnimatedComponent(BaseIcon)

export const ConvertedBetterBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ txId, amount, from, to, onClose, onFailure }: Props, ref) => {
        const { isFetching, isSuccess } = useWaitTransaction({ txId })

        const spinRotationValue = useSharedValue(0)

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
            if (isSuccess) return LL.BD_TOKEN_CONVERTED_SUCCESS()
            return LL.BD_TOKEN_CONVERTED_ERROR()
        }, [LL, isFetching, isSuccess])

        useEffect(() => {
            spinRotationValue.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1, false)
        }, [spinRotationValue])

        const infiniteSpinStyle = useAnimatedStyle(() => {
            return {
                transform: [{ rotate: `${spinRotationValue.value}deg` }],
            }
        }, [])

        return (
            <BaseBottomSheet ref={ref} blurBackdrop enablePanDownToClose dynamicHeight>
                <BaseView>
                    <BaseView alignItems="center" px={24}>
                        {isFetching ? (
                            <AnimatedIcon
                                name="icon-convert"
                                size={32}
                                color={theme.colors.title}
                                style={[infiniteSpinStyle]}
                            />
                        ) : (
                            <BaseIcon
                                name={isSuccess ? "icon-check-circle" : "icon-alert-triangle"}
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

                    {isSuccess && (
                        <>
                            <BaseText align="center" onPress={onSeeDetailsPress}>
                                {LL.BD_TRANSACTION_DETAILS()}{" "}
                                <BaseIcon name="icon-arrow-link" color={theme.colors.text} size={12} />
                            </BaseText>
                            <BaseSpacer height={24} />
                            <BaseButton action={onClose}>{LL.COMMON_BTN_OK()}</BaseButton>
                        </>
                    )}

                    {!isSuccess && !isFetching && (
                        <BaseButton action={onFailure}>{LL.COMMON_BTN_TRY_AGAIN()}</BaseButton>
                    )}

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
                <BaseView borderRadius={30} overflow="hidden">
                    <Image source={{ uri: renderIcon }} width={24} height={24} />
                </BaseView>

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
