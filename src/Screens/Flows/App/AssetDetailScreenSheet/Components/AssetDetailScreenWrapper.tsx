import { useNavigation } from "@react-navigation/native"
import React, { PropsWithChildren } from "react"
import { StyleSheet } from "react-native"
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { BaseSafeArea, BaseSpacer } from "~Components"
import { BaseBottomSheetHandle } from "~Components/Base/BaseBottomSheetHandle"
import { COLORS, ColorThemeType, SCREEN_HEIGHT } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const AssetDetailScreenWrapper = ({ children }: PropsWithChildren) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const nav = useNavigation()

    const height = useSharedValue(SCREEN_HEIGHT)
    const translateY = useSharedValue(SCREEN_HEIGHT)

    const animatedS = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        }
    }, [translateY.value])

    const backdropStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: `rgba(0, 0, 0, ${interpolate(
                translateY.value,
                [0, height.value],
                [0.85, 0],
                Extrapolation.CLAMP,
            )})`,
        }
    }, [translateY.value, height.value])

    useAnimatedReaction(
        () => height.value,
        result => {
            if (result !== SCREEN_HEIGHT) {
                translateY.value = withTiming(0, {
                    duration: 500,
                })
            }
        },
    )
    return (
        <BaseSafeArea grow={1} style={styles.safeArea} bg="transparent">
            <>
                <Animated.View
                    style={[StyleSheet.absoluteFillObject, backdropStyles]}
                    onTouchStart={() => {
                        translateY.value = withTiming(height.value, { duration: 500 }, finished => {
                            if (finished) runOnJS(nav.goBack)()
                        })
                    }}
                />
                <Animated.View
                    style={[styles.root, animatedS]}
                    onLayout={e => {
                        translateY.value = height.value
                        height.value = e.nativeEvent.layout.height
                    }}>
                    <BaseBottomSheetHandle color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300} />
                    <BaseSpacer height={8} />
                    {children}
                </Animated.View>
            </>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            zIndex: 1,
            position: "relative",
            overflow: "hidden",
            paddingBottom: 16,
            transformOrigin: "bottom",
        },
        safeArea: {
            justifyContent: "flex-end",
        },
    })
