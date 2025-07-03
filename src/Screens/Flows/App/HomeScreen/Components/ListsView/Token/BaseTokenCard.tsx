import React, { useMemo } from "react"
import { FlexAlignType, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSkeleton, BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { VET } from "~Constants"
import { COLORS } from "~Constants/Theme"
import { useTheme } from "~Hooks"
import { isVechainToken } from "~Utils/TokenUtils/TokenUtils"

type BaseTokenCardProps = {
    icon: string
    symbol: string
    isLoading: boolean
    isBalanceVisible: boolean
    tokenBalance: string
    rightContent: React.ReactNode
    alignWithFiatBalance?: FlexAlignType
    isCrossChainToken?: boolean
}

export const BaseTokenCard = ({
    icon,
    symbol,
    isLoading,
    isBalanceVisible,
    tokenBalance,
    rightContent,
    alignWithFiatBalance,
    isCrossChainToken,
}: BaseTokenCardProps) => {
    const theme = useTheme()
    const tokenValueLabelColor = theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500

    const alignTokenBalance = useMemo(() => {
        if (alignWithFiatBalance) return alignWithFiatBalance
        return symbol === VET.symbol ? "flex-start" : "center"
    }, [alignWithFiatBalance, symbol])

    const isVetToken = isVechainToken(symbol)

    return (
        <Animated.View style={[styles.innerRow, { alignItems: alignTokenBalance }]}>
            <BaseView flexDirection="row" gap={12}>
                <TokenImage
                    icon={icon}
                    isVechainToken={isVetToken}
                    iconSize={26}
                    isCrossChainToken={isCrossChainToken}
                />
                <BaseView alignItems="center" justifyContent="center" flexDirection="row" gap={4}>
                    <BaseText typographyFont="subSubTitleSemiBold">{symbol}</BaseText>

                    <BaseView flexDirection="row">
                        {isLoading ? (
                            <BaseView flexDirection="row">
                                <BaseSkeleton
                                    containerStyle={styles.skeletonBalance}
                                    animationDirection="horizontalLeft"
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={theme.colors.skeletonHighlightColor}
                                    height={14}
                                />
                            </BaseView>
                        ) : (
                            <BaseView flexDirection="row">
                                <BaseText
                                    typographyFont="subSubTitleMedium"
                                    color={tokenValueLabelColor}
                                    lineHeight={24}>
                                    {isBalanceVisible ? tokenBalance : "•••••"}{" "}
                                </BaseText>
                            </BaseView>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
            {rightContent}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 16,
    },
    skeletonBalance: { width: 50, paddingVertical: 2 },
})
