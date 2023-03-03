import { Pressable, StyleSheet } from "react-native"
import React, { memo } from "react"
import { BaseText, BaseView } from "~Components"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { ColorThemeType, useThemedStyles } from "~Common"

const LONG_WIDTH = 20

export const TabbarHeader = memo(
    ({ action }: { action: (activeScreen: number) => void }) => {
        const { styles } = useThemedStyles(baseStyles)
        const progressValue = useSharedValue<number>(0)

        const onTokensPress = () => {
            action(0)
            progressValue.value = 0
        }
        const onNftPress = () => {
            action(1)
            progressValue.value = 1
        }

        const animatedWidthToken = useAnimatedStyle(() => {
            return {
                width: withTiming(progressValue.value === 0 ? LONG_WIDTH : 0, {
                    duration: 200,
                }),
                opacity: withTiming(progressValue.value === 0 ? 1 : 0, {
                    duration: 200,
                }),
            }
        }, [])

        const animatedWidthNft = useAnimatedStyle(() => {
            return {
                width: withTiming(progressValue.value === 1 ? LONG_WIDTH : 0, {
                    duration: 200,
                }),
                opacity: withTiming(progressValue.value === 1 ? 1 : 0, {
                    duration: 200,
                }),
            }
        }, [])

        return (
            <BaseView align="center">
                <BaseView
                    w={50}
                    orientation="row"
                    justify="space-between"
                    align="center">
                    <Pressable onPress={onTokensPress} style={styles.button}>
                        <BaseText typographyFont="bodyAccent">
                            {"Token"}
                        </BaseText>
                        <Animated.View
                            style={[styles.underline, animatedWidthToken]}
                        />
                    </Pressable>

                    <Pressable onPress={onNftPress} style={styles.button}>
                        <BaseText typographyFont="bodyAccent">{"NFT"}</BaseText>
                        <Animated.View
                            style={[styles.underline, animatedWidthNft]}
                        />
                    </Pressable>
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        underline: {
            height: 4,
            borderRadius: 10,
            backgroundColor: theme.colors.text,
            marginTop: 5,
        },
        button: {
            paddingHorizontal: 10,
            paddingTop: 10,
            alignItems: "center",
            justifyContent: "center",
        },
    })
