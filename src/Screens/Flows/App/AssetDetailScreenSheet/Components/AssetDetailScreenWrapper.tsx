import { useNavigation } from "@react-navigation/native"
import React, { PropsWithChildren } from "react"
import { StyleSheet, View } from "react-native"
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
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const AssetDetailScreenWrapper = ({ children }: PropsWithChildren) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const nav = useNavigation()

    const height = useSharedValue(0)
    const rendering = useSharedValue(0)

    const animatedS = useAnimatedStyle(() => {
        return {
            height: interpolate(rendering.value, [0, 1], [0, height.value], Extrapolation.CLAMP),
        }
    }, [])

    const backdropStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: `rgba(0, 0, 0, ${interpolate(rendering.value, [0, 1], [0, 0.85], Extrapolation.CLAMP)})`,
        }
    }, [])

    useAnimatedReaction(
        () => height.value,
        result => {
            if (result !== 0)
                rendering.value = withTiming(1, {
                    duration: 300,
                })
        },
    )
    return (
        <BaseSafeArea grow={1} style={styles.safeArea} bg="transparent">
            <>
                <Animated.View
                    style={[StyleSheet.absoluteFillObject, backdropStyles]}
                    onTouchStart={() => {
                        rendering.value = withTiming(
                            0,
                            {
                                duration: 300,
                            },
                            finished => {
                                if (finished) runOnJS(nav.goBack)()
                            },
                        )
                    }}
                />
                <Animated.View style={[styles.root, animatedS]}>
                    {/* Create a nested view in absolute to animate it correctly */}
                    <View
                        onLayout={e => {
                            height.value = e.nativeEvent.layout.height
                        }}
                        style={styles.wrapper}>
                        <BaseBottomSheetHandle color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300} />
                        <BaseSpacer height={8} />
                        {children}
                    </View>
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
        },
        safeArea: {
            justifyContent: "flex-end",
        },
        wrapper: {
            position: "absolute",
            left: 0,
            bottom: 0,
            paddingBottom: 16,
        },
    })
