import React, { memo, useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { useTheme } from "~Hooks"
import { VechainTokenCard } from "./VechainTokenCard"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { LineChart } from "react-native-wagmi-charts"
import { FungibleToken } from "~Model"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { BaseView } from "~Components"
import HapticsService from "~Services/HapticsService"
import {
    DEFAULT_CHART_DATA,
    getCoinGeckoIdBySymbol,
    useMarketChart,
} from "~Api"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

const HEIGHT = 100

export type NativeTokenProps = {
    token: FungibleToken
    isEdit: boolean
    isBalanceVisible: boolean
}

export const AnimatedChartCard = memo(
    ({ token, isEdit, isBalanceVisible }: NativeTokenProps) => {
        const nav = useNavigation()
        const theme = useTheme()

        const currency = useAppSelector(selectCurrency)

        const { data: chartData } = useMarketChart({
            id: getCoinGeckoIdBySymbol[token.symbol],
            vs_currency: currency,
            days: 7,
            placeholderData: DEFAULT_CHART_DATA,
        })

        const animatedOuterCard = useAnimatedStyle(() => {
            return {
                height: withTiming(isEdit ? 62 : 162, {
                    duration: 200,
                }),

                backgroundColor: withTiming(
                    isEdit ? theme.colors.neutralDisabled : theme.colors.card,
                    {
                        duration: 200,
                    },
                ),
            }
        }, [isEdit, theme.isDark])

        const animatedInnerCard = useAnimatedStyle(() => {
            return {
                height: withTiming(isEdit ? 0 : HEIGHT, {
                    duration: 200,
                }),

                opacity: withTiming(isEdit ? 0 : 1, {
                    duration: 200,
                }),
            }
        }, [isEdit])

        const onVechainTokenPress = useCallback(() => {
            HapticsService.triggerImpact({ level: "Light" })
            if (!isEdit) nav.navigate(Routes.TOKEN_DETAILS, { token: token })
        }, [isEdit, nav, token])

        return (
            <BaseView>
                <TouchableOpacity
                    activeOpacity={isEdit ? 1 : 0.6}
                    onPress={onVechainTokenPress}>
                    <Animated.View
                        style={[
                            styles.nativeTokenContainer,
                            animatedOuterCard,
                        ]}>
                        <VechainTokenCard
                            isBalanceVisible={isBalanceVisible}
                            token={token}
                            isAnimation={isEdit}
                        />
                        <Animated.View style={animatedInnerCard}>
                            {/* chartData is always defined because we passed initalData to useMarketChart */}
                            <LineChart.Provider
                                data={chartData ?? DEFAULT_CHART_DATA}>
                                <LineChart height={HEIGHT}>
                                    <LineChart.Path
                                        color={theme.colors.primary}
                                        width={2}>
                                        <LineChart.Gradient />
                                    </LineChart.Path>
                                </LineChart>
                            </LineChart.Provider>
                        </Animated.View>
                    </Animated.View>
                </TouchableOpacity>
            </BaseView>
        )
    },
)

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
