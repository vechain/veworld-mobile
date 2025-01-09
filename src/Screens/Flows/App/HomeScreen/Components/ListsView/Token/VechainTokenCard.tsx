import { Image, StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseText, BaseView, BaseSpacer, BaseSkeleton } from "~Components"
import Animated from "react-native-reanimated"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import { COLORS } from "~Constants"
import FiatBalance from "~Screens/Flows/App/HomeScreen/Components/AccountCard/FiatBalance"
import { useTokenCardFiatInfo } from "./useTokenCardFiatInfo"
import { useI18nContext } from "~i18n"
import { TokenCardBalanceInfo } from "./TokenCardBalanceInfo"

type Props = {
    tokenWithInfo: TokenWithCompleteInfo
    isBalanceVisible: boolean
}

export const VechainTokenCard = memo(({ tokenWithInfo, isBalanceVisible }: Props) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const { isTokensOwnedLoading, fiatBalance, exchangeRate, isPositive24hChange, change24h, isLoading } =
        useTokenCardFiatInfo(tokenWithInfo)

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
        return (
            <FiatBalance
                typographyFont="captionRegular"
                color={theme.colors.tokenCardText}
                balances={[fiatBalance]}
                isVisible={isBalanceVisible}
            />
        )
    }, [isTokensOwnedLoading, theme.colors, exchangeRate, LL, fiatBalance, isBalanceVisible])

    const tokenValueLabelColor = theme.isDark ? COLORS.PRIMARY_200 : COLORS.GREY_500

    return (
        <Animated.View style={[baseStyles.innerRow]}>
            <BaseView flexDirection="row">
                <BaseView style={[baseStyles.imageContainer]}>
                    <Image source={{ uri: tokenWithInfo.icon }} style={baseStyles.image} />
                </BaseView>
                <BaseSpacer width={12} />
                <BaseView>
                    <BaseText typographyFont="captionSemiBold">{tokenWithInfo.symbol}</BaseText>
                    <BaseView flexDirection="row" alignItems="baseline" justifyContent="flex-start">
                        {isLoading ? (
                            <BaseView flexDirection="row" alignItems="center">
                                <BaseSkeleton
                                    containerStyle={baseStyles.skeletonBalance}
                                    animationDirection="horizontalLeft"
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={theme.colors.skeletonHighlightColor}
                                    height={14}
                                />
                            </BaseView>
                        ) : (
                            <BaseView flexDirection="row" alignItems="center">
                                <BaseText typographyFont="captionRegular" color={tokenValueLabelColor}>
                                    {isBalanceVisible ? tokenWithInfo.tokenUnitBalance : "•••••"}{" "}
                                </BaseText>
                            </BaseView>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
            <TokenCardBalanceInfo
                renderFiatBalance={renderFiatBalance}
                isLoading={isLoading}
                isPositive24hChange={isPositive24hChange}
                change24h={change24h}
            />
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
    tokenIcon: {
        width: 40,
        height: 40,
        backgroundColor: "red",
        borderRadius: 20,
        marginRight: 10,
    },
    balancesContainer: {
        alignItems: "flex-end",
    },
    skeletonBalance: { width: 50, paddingVertical: 2 },
    skeletonPercentChange: {
        width: 40,
        paddingVertical: 1,
    },
    skeletonBalanceValue: {
        width: 60,
        paddingVertical: 2,
    },
})
