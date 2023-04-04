import React, { memo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import { VechainTokenCard } from "./VechainTokenCard"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseView } from "~Components"
import { LineChart } from "react-native-wagmi-charts"
import { DenormalizedAccountTokenBalance } from "~Storage/Redux/Types"

const HEIGHT = 100

export type NativeTokenProps = {
    token: DenormalizedAccountTokenBalance
    isEdit: boolean
}

const CHART_DATA = [
    { timestamp: 0, value: 12 },
    { timestamp: 1, value: 8 },
    { timestamp: 2, value: 6 },
    { timestamp: 3, value: 9 },
    { timestamp: 4, value: 11 },
    { timestamp: 5, value: 10 },
    { timestamp: 6, value: 10.4 },
    { timestamp: 7, value: 7 },
    { timestamp: 8, value: 8 },
    { timestamp: 9, value: 12 },
    { timestamp: 10, value: 14 },
    { timestamp: 11, value: 12 },
    { timestamp: 12, value: 13.5 },
]

export const AnimatedChartCard = memo(({ token, isEdit }: NativeTokenProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)

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
                <BaseView w={100} flexGrow={1} px={12}>
                    <VechainTokenCard token={token} isAnimation={isEdit} />
                </BaseView>

                <Animated.View style={[styles.fullWidth, animatedInnerCard]}>
                    <LineChart.Provider data={CHART_DATA}>
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
})

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
