import { Image, StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseText, BaseCard, BaseView, BaseSpacer, BaseSkeleton } from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import { BigNutils } from "~Utils"
import { selectIsTokensOwnedLoading } from "~Storage/Redux/Selectors"
import { useAppSelector } from "~Storage/Redux"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import FiatBalance from "../../AccountCard/FiatBalance"

type Props = {
    tokenWithInfo: TokenWithCompleteInfo
    isAnimation: boolean
    isBalanceVisible: boolean
}

export const VechainTokenCard = memo(({ tokenWithInfo, isAnimation, isBalanceVisible }: Props) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const { tokenInfo, tokenInfoLoading, fiatBalance, tokenUnitBalance, exchangeRate } = tokenWithInfo

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

    const typographyFont = useMemo(() => (fiatBalance.length > 6 ? "body" : "subTitleBold"), [fiatBalance.length])

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
                typographyFont={typographyFont}
                color={theme.colors.text}
                balances={[fiatBalance]}
                isVisible={isBalanceVisible}
            />
        )
    }, [
        isTokensOwnedLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        theme.colors.text,
        exchangeRate,
        LL,
        typographyFont,
        fiatBalance,
        isBalanceVisible,
    ])

    const tokenValueLabelColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED

    const isLoading = tokenInfoLoading || isTokensOwnedLoading

    return (
        <Animated.View style={[baseStyles.innerRow]}>
            <BaseView flexDirection="row">
                <BaseCard
                    style={[baseStyles.imageContainer, { backgroundColor: COLORS.WHITE }]}
                    containerStyle={baseStyles.imageShadow}>
                    <Image source={{ uri: tokenWithInfo.icon }} style={baseStyles.image} />
                </BaseCard>
                <BaseSpacer width={16} />
                <BaseView>
                    <BaseText typographyFont="subTitleBold">{tokenWithInfo.name}</BaseText>
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
                                <BaseText typographyFont="captionRegular" color={tokenValueLabelColor} pl={4}>
                                    {tokenWithInfo.symbol}
                                </BaseText>
                            </BaseView>
                        ) : (
                            <BaseView flexDirection="row" alignItems="center">
                                <BaseText typographyFont="bodyMedium" color={tokenValueLabelColor}>
                                    {isBalanceVisible ? tokenUnitBalance : "•••••"}{" "}
                                </BaseText>
                                <BaseText typographyFont="captionRegular" color={tokenValueLabelColor}>
                                    {tokenWithInfo.symbol}
                                </BaseText>
                            </BaseView>
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
                        typographyFont="captionBold"
                        color={isPositive24hChange ? theme.colors.success : theme.colors.danger}>
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
        padding: 10,
    },
    imageShadow: {
        width: "auto",
    },
    image: { width: 20, height: 20 },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        flexGrow: 1,
        paddingHorizontal: 12,
    },
    tokenIcon: {
        width: 40,
        height: 40,
        backgroundColor: "red",
        borderRadius: 20,
        marginRight: 10,
        position: "absolute",
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
