import React from "react"
import { StyleSheet } from "react-native"
import { Chart, Line, Area } from "react-native-responsive-linechart"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import { FungibleToken } from "~Common/Constant/Token/TokenConstants"
import { TokenCard } from "./TokenCard"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseView } from "~Components"

const HEIGHT = 100

type Props = {
    token: FungibleToken
    isEdit: boolean
}

const CHART_DATA = [
    { x: 0, y: 12 },
    { x: 1, y: 8 },
    { x: 2, y: 6 },
    { x: 3, y: 9 },
    { x: 4, y: 11 },
    { x: 5, y: 10 },
    { x: 6, y: 10.4 },
    { x: 7, y: 7 },
    { x: 8, y: 8 },
    { x: 9, y: 12 },
    { x: 10, y: 14 },
    { x: 11, y: 12 },
    { x: 12, y: 13.5 },
]

export const AnimatedChartCard = ({ token, isEdit }: Props) => {
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
    }, [isEdit])

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
                <BaseView w={100} grow={1} px={12}>
                    <TokenCard token={token} isAnimation={isEdit} />
                </BaseView>

                <Animated.View style={[styles.fullWidth, animatedInnerCard]}>
                    {/* https://github.com/bluephoton/react-native-responsive-linechart/commit/f5257ce0c982d4918b93e1542c5ab52917808bac */}
                    {/*
                    // @ts-ignore */}
                    <Chart
                        disableGestures
                        disableTouch
                        style={{ height: HEIGHT }}
                        data={CHART_DATA}
                        xDomain={{ min: 0, max: 12 }}
                        yDomain={{ min: 0, max: 15 }}>
                        <Area
                            theme={{
                                gradient: {
                                    from: {
                                        color: theme.colors.primary,
                                    },
                                    to: {
                                        color: theme.colors.primary,
                                        opacity: 0.1,
                                    },
                                },
                            }}
                        />
                        <Line
                            theme={{
                                stroke: {
                                    color: theme.colors.primary,
                                    width: 3,
                                },
                            }}
                        />
                    </Chart>
                </Animated.View>
            </Animated.View>
        </DropShadow>
    )
}

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
