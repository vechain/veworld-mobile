import React, { memo, useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { TokenWithCompleteInfo, useTheme } from "~Hooks"
import { VechainTokenCard } from "./VechainTokenCard"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { LineChart } from "react-native-wagmi-charts"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { BaseView } from "~Components"
import HapticsService from "~Services/HapticsService"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"

const HEIGHT = 100

export type NativeTokenProps = {
    tokenWithInfo: TokenWithCompleteInfo
    isEdit: boolean
    isBalanceVisible: boolean
    hideChart?: boolean
}

export const AnimatedChartCard = memo(({ tokenWithInfo, isEdit, isBalanceVisible, hideChart }: NativeTokenProps) => {
    const nav = useNavigation()
    const theme = useTheme()

    const currency = useAppSelector(selectCurrency)

    const { data: chartData } = useSmartMarketChart({
        id: getCoinGeckoIdBySymbol[tokenWithInfo.symbol],
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const animatedOuterCard = useAnimatedStyle(() => {
        return {
            height: withTiming(isEdit || hideChart ? 62 : 162, {
                duration: 200,
            }),

            backgroundColor: withTiming(isEdit ? theme.colors.neutralDisabled : theme.colors.card, {
                duration: 200,
            }),
        }
    }, [isEdit, theme.isDark])

    const animatedInnerCard = useAnimatedStyle(() => {
        return {
            height: withTiming(isEdit || hideChart ? 0 : HEIGHT, {
                duration: 200,
            }),

            opacity: withTiming(isEdit ? 0 : 1, {
                duration: 200,
            }),
        }
    }, [isEdit])

    const onVechainTokenPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        if (!isEdit) nav.navigate(Routes.TOKEN_DETAILS, { token: tokenWithInfo })
    }, [isEdit, nav, tokenWithInfo])

    return (
        <BaseView>
            <TouchableOpacity activeOpacity={isEdit ? 1 : 0.6} onPress={onVechainTokenPress}>
                <Animated.View style={[styles.nativeTokenContainer, animatedOuterCard]}>
                    <VechainTokenCard
                        isBalanceVisible={isBalanceVisible}
                        tokenWithInfo={tokenWithInfo}
                        isAnimation={isEdit}
                    />
                    {!hideChart && (
                        <Animated.View style={animatedInnerCard}>
                            <LineChart.Provider data={chartData ?? DEFAULT_LINE_CHART_DATA}>
                                <LineChart height={HEIGHT}>
                                    <LineChart.Path color={theme.colors.primary} width={2}>
                                        <LineChart.Gradient />
                                    </LineChart.Path>
                                </LineChart>
                            </LineChart.Provider>
                        </Animated.View>
                    )}
                </Animated.View>
            </TouchableOpacity>
        </BaseView>
    )
})

const styles = StyleSheet.create({
    nativeTokenContainer: {
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 10,
        borderRadius: 16,
        overflow: "hidden",
        marginHorizontal: 20,
    },
})
