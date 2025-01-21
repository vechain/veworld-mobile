import React from "react"
import { BaseText, BaseView, BaseSpacer, BaseSkeleton } from "~Components"
import Animated from "react-native-reanimated"
import { useTheme } from "~Hooks"
import { StyleSheet } from "react-native"

type Props = {
    renderFiatBalance: React.ReactNode
    isLoading: boolean
    isPositive24hChange?: boolean
    change24h?: string
}

export const TokenCardBalanceInfo = ({ renderFiatBalance, isLoading, isPositive24hChange, change24h }: Props) => {
    const theme = useTheme()
    return (
        <Animated.View style={baseStyles.container}>
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
                <BaseView flexDirection="row" alignItems="flex-start">
                    {renderFiatBalance}
                </BaseView>
            )}

            <BaseSpacer height={2} />

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
                    typographyFont="captionMedium"
                    color={isPositive24hChange ? theme.colors.positive : theme.colors.negative}>
                    {change24h}
                </BaseText>
            )}
        </Animated.View>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        alignItems: "flex-end",
        justifyContent: "flex-start",
    },
})
