import { Image, StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseText, BaseView, BaseSpacer, BaseSkeleton } from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import { BigNutils } from "~Utils"
import { selectIsTokensOwnedLoading } from "~Storage/Redux/Selectors"
import { useAppSelector } from "~Storage/Redux"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import FiatBalance from "../../AccountCard/FiatBalance"

type Props = {
    b3trToken: TokenWithCompleteInfo
    vot3Token: TokenWithCompleteInfo
    isAnimation: boolean
    isBalanceVisible: boolean
}

export const VeB3trTokenCard = memo(({ b3trToken, vot3Token, isAnimation, isBalanceVisible }: Props) => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const { tokenInfo, tokenInfoLoading, fiatBalance: b3trFiatBalance, exchangeRate } = b3trToken

    const isPositive24hChange = (tokenInfo?.market_data?.price_change_percentage_24h ?? 0) >= 0

    const change24h =
        (isPositive24hChange ? "+" : "") +
        BigNutils(tokenInfo?.market_data?.price_change_percentage_24h ?? 0)
            .toHuman(0)
            .decimals(2).toString +
        "%"

    const animatedOpacityReverse = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isAnimation ? 0 : 1, {
                duration: 200,
            }),
        }
    }, [isAnimation])

    const renderFiatBalance = useMemo(() => {
        if (isTokensOwnedLoading)
            return (
                <BaseView flexDirection="row" alignItems="center">
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={14}
                        width={60}
                    />
                </BaseView>
            )
        if (!exchangeRate) return <BaseText typographyFont="bodyMedium">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>

        const vot3FiatBalance = BigNutils(vot3Token.tokenUnitFullBalance).multiply(exchangeRate).toString

        return (
            <FiatBalance
                typographyFont="captionRegular"
                color={theme.colors.tokenCardText}
                balances={[b3trFiatBalance, vot3FiatBalance]}
                isVisible={isBalanceVisible}
            />
        )
    }, [isTokensOwnedLoading, theme.colors, exchangeRate, LL, vot3Token, b3trFiatBalance, isBalanceVisible])

    const tokenValueLabelColor = theme.isDark ? COLORS.PRIMARY_200 : COLORS.GREY_500
    const isLoading = tokenInfoLoading || isTokensOwnedLoading

    return (
        <Animated.View style={[baseStyles.innerRow]}>
            <BaseView flexDirection="row">
                <BaseView style={[baseStyles.imageContainer]}>
                    <Image source={{ uri: b3trToken.icon }} style={baseStyles.image} />
                </BaseView>
                <BaseSpacer width={12} />
                <BaseView flexDirection="row">
                    <BaseView flexDirection="column" alignItems="center">
                        <BaseText typographyFont="captionSemiBold">{b3trToken.symbol}</BaseText>
                        <BaseText typographyFont="captionSemiBold">{vot3Token.symbol}</BaseText>
                    </BaseView>
                    <BaseSpacer height={2} />
                    <BaseView flexDirection="column" alignItems="center" ml={8}>
                        {isLoading ? (
                            <BaseSkeleton
                                animationDirection="horizontalLeft"
                                boneColor={theme.colors.skeletonBoneColor}
                                highlightColor={theme.colors.skeletonHighlightColor}
                                height={12}
                                width={40}
                            />
                        ) : (
                            <BaseText typographyFont="captionRegular" color={tokenValueLabelColor}>
                                {isBalanceVisible ? b3trToken.tokenUnitBalance : "•••••"}
                            </BaseText>
                        )}
                        {isLoading ? (
                            <BaseSkeleton
                                animationDirection="horizontalLeft"
                                boneColor={theme.colors.skeletonBoneColor}
                                highlightColor={theme.colors.skeletonHighlightColor}
                                height={12}
                                width={40}
                            />
                        ) : (
                            <BaseText typographyFont="captionRegular" color={tokenValueLabelColor}>
                                {isBalanceVisible ? vot3Token.tokenUnitBalance : "•••••"}
                            </BaseText>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
            <Animated.View style={[animatedOpacityReverse, baseStyles.balancesContainer]}>
                <BaseView flexDirection="row" alignItems="center">
                    {renderFiatBalance}
                </BaseView>

                <BaseSpacer height={3} />

                {isLoading ? (
                    <BaseView flexDirection="row" alignItems="center">
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            height={14}
                            width={60}
                        />
                    </BaseView>
                ) : (
                    <BaseText
                        typographyFont="captionRegular"
                        color={isPositive24hChange ? theme.colors.positive : theme.colors.negative}>
                        {change24h}
                    </BaseText>
                )}
            </Animated.View>
        </Animated.View>
    )
})

const baseStyles = StyleSheet.create({
    imageContainer: {
        borderRadius: 30,
        padding: 9,
        backgroundColor: COLORS.GREY_50,
    },
    imageShadow: {
        width: "auto",
    },
    image: { width: 14, height: 14 },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        flexGrow: 1,
    },
    balancesContainer: {
        alignItems: "flex-end",
    },
})
