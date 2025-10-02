import React, { memo, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSkeleton, BaseSpacer, BaseText, BaseView, FiatBalance } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS } from "~Constants/Theme"
import { useCombineFiatBalances, useTheme, useTokenCardFiatInfo, useTokenWithCompleteInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"
import { TokenCardBalanceInfo } from "./TokenCardBalanceInfo"

type Props = {
    isBalanceVisible: boolean
    isAnimation: boolean
}

export const VeB3trTokenCard = memo(({ isBalanceVisible, isAnimation }: Props) => {
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const [width, setWidth] = useState<"auto" | number>("auto")

    const theme = useTheme()
    const { LL } = useI18nContext()

    const vot3Token = useTokenWithCompleteInfo(VOT3)
    const b3trToken = useTokenWithCompleteInfo(B3TR)

    const { combineFiatBalances } = useCombineFiatBalances()

    const tokenValueLabelColor = theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500

    const {
        isTokensOwnedLoading,
        exchangeRate,
        isPositive24hChange,
        change24h,
        isLoading,
        fiatBalance: b3trFiat,
    } = useTokenCardFiatInfo(b3trToken)

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3Token?.balance?.balance ?? "0",
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
        if (!exchangeRate)
            return <BaseText typographyFont="bodySemiBold">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>

        return (
            <FiatBalance
                typographyFont="subSubTitleMedium"
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
            <BaseView flexDirection="row" alignItems="flex-start" gap={12}>
                <TokenImage isVechainToken iconSize={26} icon={B3TR.icon} />
                <BaseView flexDirection="column" alignItems="flex-start">
                    <BaseView flexDirection="row" gap={4}>
                        <BaseText typographyFont="subSubTitleSemiBold" style={{ width }}>
                            {b3trToken.symbol}
                        </BaseText>
                        {isLoading ? (
                            <BaseSkeleton
                                animationDirection="horizontalLeft"
                                boneColor={theme.colors.skeletonBoneColor}
                                highlightColor={theme.colors.skeletonHighlightColor}
                                height={14}
                                width={40}
                            />
                        ) : (
                            <BaseText typographyFont="subSubTitleSemiBold" align="right" lineHeight={24}>
                                {isBalanceVisible ? b3trToken.tokenUnitBalance : "•••••"}
                            </BaseText>
                        )}
                    </BaseView>
                    <BaseSpacer height={2} />
                    <BaseView flexDirection="row" gap={4}>
                        <BaseText
                            typographyFont="subSubTitleSemiBold"
                            onLayout={e => {
                                setWidth(e.nativeEvent.layout.width)
                            }}>
                            {vot3Token.symbol}
                        </BaseText>
                        {isLoading ? (
                            <BaseSkeleton
                                animationDirection="horizontalLeft"
                                boneColor={theme.colors.skeletonBoneColor}
                                highlightColor={theme.colors.skeletonHighlightColor}
                                height={14}
                                width={40}
                            />
                        ) : (
                            <BaseText typographyFont="subSubTitleSemiBold" align="right" lineHeight={24}>
                                {isBalanceVisible ? vot3Token.tokenUnitBalance : "•••••"}
                            </BaseText>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
            <TokenCardBalanceInfo
                renderFiatBalance={renderFiatBalance}
                isLoading={isLoading}
                isPositive24hChange={isPositive24hChange}
                change24h={change24h}
                isAnimation={isAnimation}
            />
        </Animated.View>
    )
})

const baseStyles = StyleSheet.create({
    tokenSymbol: {
        width: 44,
    },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
        paddingHorizontal: 16,
    },
})
