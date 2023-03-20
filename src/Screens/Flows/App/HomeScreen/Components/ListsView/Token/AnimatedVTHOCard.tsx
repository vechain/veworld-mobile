import { StyleSheet } from "react-native"
import React, { memo } from "react"
import { NativeTokenProps } from "./AnimatedChartCard"
import { ColorThemeType, useThemedStyles } from "~Common"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import DropShadow from "react-native-drop-shadow"
import { BaseView } from "~Components"
import { TokenCard } from "./TokenCard"

export const AnimatedVTHOCard = memo(({ token, isEdit }: NativeTokenProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const animatedOuterCard = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(
                isEdit ? theme.colors.neutralDisabled : theme.colors.card,
                {
                    duration: 200,
                },
            ),
        }
    }, [isEdit, theme.isDark])

    return (
        <DropShadow style={styles.cardShadow}>
            <Animated.View
                style={[styles.nativeTokenContainer, animatedOuterCard]}>
                <BaseView w={100} grow={1} px={12}>
                    <TokenCard token={token} isAnimation={isEdit} />
                </BaseView>
            </Animated.View>
        </DropShadow>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        nativeTokenContainer: {
            height: 62,
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 10,
            borderRadius: 10,
            overflow: "hidden",
            marginHorizontal: 20,
        },

        fullWidth: { width: "100%" },
        cardShadow: theme.shadows.card,
    })
