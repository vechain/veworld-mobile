import React, { memo, useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { TokenWithCompleteInfo, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { VechainTokenCard } from "./VechainTokenCard"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { BaseView } from "~Components"
import HapticsService from "~Services/HapticsService"
import { B3TR, ColorThemeType, VOT3 } from "~Constants"
import { VeB3trTokenCard } from "./VeB3trTokenCard"

export type NativeTokenProps = {
    tokenWithInfo: TokenWithCompleteInfo
    isEdit: boolean
    isBalanceVisible: boolean
}

export const AnimatedChartCard = memo(({ tokenWithInfo, isEdit, isBalanceVisible }: NativeTokenProps) => {
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)

    const animatedOuterCard = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(isEdit ? theme.colors.neutralDisabled : theme.colors.card, {
                duration: 200,
            }),
        }
    }, [isEdit, theme.isDark])

    const onVechainTokenPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        if (!isEdit) nav.navigate(Routes.TOKEN_DETAILS, { token: tokenWithInfo })
    }, [isEdit, nav, tokenWithInfo])

    const isB3tr = tokenWithInfo.symbol === B3TR.symbol

    const vot3TokenInfo = useTokenWithCompleteInfo(VOT3)

    return (
        <BaseView px={20} mb={4}>
            <TouchableOpacity activeOpacity={isEdit ? 1 : 0.6} onPress={onVechainTokenPress}>
                <Animated.View style={[styles.nativeTokenContainer, animatedOuterCard]}>
                    {isB3tr ? (
                        <VeB3trTokenCard
                            isBalanceVisible={isBalanceVisible}
                            b3trToken={tokenWithInfo}
                            vot3Token={vot3TokenInfo}
                            isAnimation={isEdit}
                        />
                    ) : (
                        <VechainTokenCard
                            isBalanceVisible={isBalanceVisible}
                            tokenWithInfo={tokenWithInfo}
                            isAnimation={isEdit}
                        />
                    )}
                </Animated.View>
            </TouchableOpacity>
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        nativeTokenContainer: {
            alignItems: "center",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 14,
            backgroundColor: theme.colors.tokenCardBackground,
            borderColor: theme.colors.tokenCardBorder,
            borderWidth: 1,
        },
    })
