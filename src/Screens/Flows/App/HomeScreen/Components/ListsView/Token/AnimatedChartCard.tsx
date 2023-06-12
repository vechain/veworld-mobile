import React, { memo, useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { useTheme } from "~Hooks"
import { VechainTokenCard } from "./VechainTokenCard"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { LineChart } from "react-native-wagmi-charts"
import { usePollingChartData } from "../../../Hooks"
import { TokenWithCompleteInfo, VeChainToken } from "~Model"
import { selectDashboardChartData, useAppSelector } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { BaseView } from "~Components"

const HEIGHT = 100

export type NativeTokenProps = {
    tokenWithInfo: TokenWithCompleteInfo
    isEdit: boolean
}

export const AnimatedChartCard = memo(
    ({ tokenWithInfo, isEdit }: NativeTokenProps) => {
        const nav = useNavigation()
        const theme = useTheme()
        usePollingChartData(tokenWithInfo.symbol as VeChainToken)

        const chartData = useAppSelector(state =>
            selectDashboardChartData(tokenWithInfo.symbol, state),
        )

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
            if (!isEdit)
                nav.navigate(Routes.TOKEN_DETAILS, { token: tokenWithInfo })
        }, [isEdit, nav, tokenWithInfo])

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
                            tokenWithInfo={tokenWithInfo}
                            isAnimation={isEdit}
                        />
                        <Animated.View style={animatedInnerCard}>
                            <LineChart.Provider data={chartData}>
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
