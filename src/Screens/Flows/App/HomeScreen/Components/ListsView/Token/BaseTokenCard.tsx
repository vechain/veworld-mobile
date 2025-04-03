import React from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSkeleton, BaseSpacer, BaseText, BaseView } from "~Components"
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
}

export const BaseTokenCard = ({
    icon,
    symbol,
    isLoading,
    isBalanceVisible,
    tokenBalance,
    rightContent,
}: BaseTokenCardProps) => {
    const theme = useTheme()
    const tokenValueLabelColor = theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500

    const alignTokenBalance = symbol === VET.symbol ? "flex-start" : "center"

    const isVetToken = isVechainToken(symbol)

    return (
        <Animated.View style={[styles.innerRow, { alignItems: alignTokenBalance }]}>
            <BaseView flexDirection="row">
                <TokenImage icon={icon} isVechainToken={isVetToken} iconSize={26} />
                <BaseSpacer width={12} />
                <BaseView alignItems="center" justifyContent="center" flexDirection="row">
                    <BaseText typographyFont="bodyBold">{symbol}</BaseText>
                    <BaseSpacer width={8} />

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
                                <BaseText typographyFont="bodyMedium" color={tokenValueLabelColor}>
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
