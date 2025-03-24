import { Image, StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseText, BaseView, BaseSpacer, BaseSkeleton, FiatBalance } from "~Components"
import Animated from "react-native-reanimated"
import { useTheme, useTokenWithCompleteInfo, useTokenCardFiatInfo, useCombineFiatBalances } from "~Hooks"
import { BalanceUtils } from "~Utils"
import { COLORS, VBD_ICON } from "~Constants"
import { useI18nContext } from "~i18n"
import { TokenCardBalanceInfo } from "./TokenCardBalanceInfo"
import { selectBalanceForToken, selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"

type Props = {
    isBalanceVisible: boolean
    isAnimation: boolean
}

export const VeB3trTokenCard = memo(({ isBalanceVisible, isAnimation }: Props) => {
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const vot3RawBalance = useAppSelector(state => selectBalanceForToken(state, VOT3.address))

    const theme = useTheme()
    const { LL } = useI18nContext()

    const vot3Token = useTokenWithCompleteInfo(VOT3)
    const b3trToken = useTokenWithCompleteInfo(B3TR)

    const { combineFiatBalances } = useCombineFiatBalances()

    const tokenValueLabelColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_800

    const {
        isTokensOwnedLoading,
        exchangeRate,
        // isPositive24hChange,
        // change24h,
        isLoading,
        fiatBalance: b3trFiat,
    } = useTokenCardFiatInfo(b3trToken)

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        exchangeRate ?? 0,
        VOT3.decimals,
    )

    const { amount: veB3trFiatBalance } = useMemo(
        () => combineFiatBalances([b3trFiat, vot3FiatBalance]),
        [b3trFiat, combineFiatBalances, vot3FiatBalance],
    )

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
                typographyFont="subSubTitleBold"
                color={tokenValueLabelColor}
                balances={[veB3trFiatBalance.toString()]}
                isVisible={isBalanceVisible}
            />
        )
    }, [
        isTokensOwnedLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        exchangeRate,
        LL,
        tokenValueLabelColor,
        veB3trFiatBalance,
        isBalanceVisible,
    ])

    return (
        <Animated.View style={[baseStyles.innerRow]}>
            <BaseView flexDirection="row" alignItems="flex-start">
                <BaseView style={[baseStyles.imageContainer]}>
                    <Image source={{ uri: VBD_ICON }} style={baseStyles.image} />
                </BaseView>
                <BaseSpacer width={14} />
                <BaseView flexDirection="column" alignItems="flex-start">
                    <BaseView flexDirection="row">
                        <BaseView style={baseStyles.tokenSymbol}>
                            <BaseText color={tokenValueLabelColor} typographyFont="bodyBold">
                                {b3trToken.symbol}
                            </BaseText>
                        </BaseView>
                        <BaseSpacer width={2} />
                        {isLoading ? (
                            <BaseSkeleton
                                animationDirection="horizontalLeft"
                                boneColor={theme.colors.skeletonBoneColor}
                                highlightColor={theme.colors.skeletonHighlightColor}
                                height={12}
                                width={40}
                            />
                        ) : (
                            <BaseText typographyFont="bodyMedium" align="right" color={theme.colors.tokenCardText}>
                                {isBalanceVisible ? b3trToken.tokenUnitBalance : "•••••"}
                            </BaseText>
                        )}
                    </BaseView>
                    <BaseSpacer height={2} />
                    <BaseView flexDirection="row">
                        <BaseView style={baseStyles.tokenSymbol}>
                            <BaseText typographyFont="bodyBold">{vot3Token.symbol}</BaseText>
                        </BaseView>
                        <BaseSpacer width={2} />
                        {isLoading ? (
                            <BaseSkeleton
                                animationDirection="horizontalLeft"
                                boneColor={theme.colors.skeletonBoneColor}
                                highlightColor={theme.colors.skeletonHighlightColor}
                                height={12}
                                width={40}
                            />
                        ) : (
                            <BaseText typographyFont="bodyMedium" align="right" color={theme.colors.tokenCardText}>
                                {isBalanceVisible ? vot3Token.tokenUnitBalance : "•••••"}
                            </BaseText>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
            <TokenCardBalanceInfo
                renderFiatBalance={renderFiatBalance}
                isLoading={isLoading}
                // isPositive24hChange={isPositive24hChange}
                // change24h={change24h}
                isAnimation={isAnimation}
            />
        </Animated.View>
    )
})

const baseStyles = StyleSheet.create({
    tokenSymbol: {
        width: 44,
    },
    imageContainer: {
        borderRadius: 30,
        padding: 5,
        backgroundColor: COLORS.GREY_50,
    },
    image: { width: 16, height: 16 },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 16,
    },
})
