import React from "react"
import { BaseText, BaseView, BaseSpacer, BaseSkeleton } from "~Components"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useTheme } from "~Hooks"
import { StyleSheet } from "react-native"

type Props = {
    renderFiatBalance: React.ReactNode
    isAnimation: boolean
    isLoading: boolean
    isPositive24hChange?: boolean
    change24h?: string
}

export const TokenCardBalanceInfo = ({
    renderFiatBalance,
    isLoading,
    isPositive24hChange,
    change24h,
    isAnimation,
}: Props) => {
    const theme = useTheme()

    const animatedOpacityReverse = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isAnimation ? 0 : 1, {
                duration: 200,
            }),
        }
    }, [isAnimation])

    return (
        <Animated.View style={[animatedOpacityReverse, baseStyles.container]}>
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
            {change24h && (
                <BaseView>
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
                </BaseView>
            )}
        </Animated.View>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        alignItems: "flex-end",
        justifyContent: "center",
    },
})
