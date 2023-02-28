import { Pressable, StyleSheet } from "react-native"
import React, { memo } from "react"
import { BaseText, BaseView } from "~Components"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { Fonts, ThemeType } from "~Model"
import { useThemedStyles } from "~Common"

const LONG_WIDTH = 20

export const TabbarHeader = memo(
    ({ action }: { action: (activeScreen: number) => void }) => {
        const themedStyles = useThemedStyles(baseStyles)
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
                width: withTiming(progressValue.value === 0 ? LONG_WIDTH : 0),
                opacity: withTiming(progressValue.value === 0 ? 1 : 0),
            }
        }, [])

        const animatedWidthNft = useAnimatedStyle(() => {
            return {
                width: withTiming(progressValue.value === 1 ? LONG_WIDTH : 0),
                opacity: withTiming(progressValue.value === 1 ? 1 : 0),
            }
        }, [])

        return (
            <BaseView align="center">
                <BaseView
                    w={50}
                    orientation="row"
                    justify="space-between"
                    align="center">
                    <Pressable
                        onPress={onTokensPress}
                        style={themedStyles.button}>
                        <BaseText font={Fonts.body_accent}>{"Token"}</BaseText>
                        <Animated.View
                            style={[themedStyles.underline, animatedWidthToken]}
                        />
                    </Pressable>

                    <Pressable onPress={onNftPress} style={themedStyles.button}>
                        <BaseText font={Fonts.body_accent}>{"NFT"}</BaseText>
                        <Animated.View
                            style={[themedStyles.underline, animatedWidthNft]}
                        />
                    </Pressable>
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ThemeType) =>
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
