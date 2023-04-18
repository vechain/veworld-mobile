import React, { memo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import { VechainTokenCard } from "./VechainTokenCard"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { LineChart } from "react-native-wagmi-charts"
import { usePollingChartData } from "../../../Hooks"
import { DenormalizedAccountTokenBalance, VeChainToken } from "~Model"
import { selectDashboardChartData, useAppSelector } from "~Storage/Redux"

const HEIGHT = 100

export type NativeTokenProps = {
    tokenBalance: DenormalizedAccountTokenBalance
    isEdit: boolean
}

export const AnimatedChartCard = memo(
    ({ tokenBalance, isEdit }: NativeTokenProps) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        usePollingChartData(tokenBalance.token.symbol as VeChainToken)
        const chartData = useAppSelector(state =>
            selectDashboardChartData(tokenBalance.token.symbol, state),
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

        return (
            <DropShadow style={styles.cardShadow}>
                <Animated.View
                    style={[styles.nativeTokenContainer, animatedOuterCard]}>
                    <VechainTokenCard
                        token={tokenBalance}
                        isAnimation={isEdit}
                    />
                    <Animated.View
                        style={[styles.fullWidth, animatedInnerCard]}>
                        <LineChart.Provider data={chartData}>
                            <LineChart height={HEIGHT}>
                                <LineChart.Path color={theme.colors.primary}>
                                    <LineChart.Gradient />
                                </LineChart.Path>
                            </LineChart>
                        </LineChart.Provider>
                    </Animated.View>
                </Animated.View>
            </DropShadow>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        nativeTokenContainer: {
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 10,
            borderRadius: 16,
            overflow: "hidden",
            marginHorizontal: 20,
        },

        fullWidth: { width: "100%" },
        cardShadow: theme.shadows.card,
    })
