import { Canvas, Group, Patch, PatchProps } from "@shopify/react-native-skia"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { SharedValue, useDerivedValue } from "react-native-reanimated"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks/useTheme"

export type SwipeDirection = "left" | "right" | "none"

type EdgeSwipeIndicatorProps = {
    canvasSize: { width: number; height: number }
    swipeDirection: SharedValue<SwipeDirection>
    leftPatch: PatchProps["patch"] | SharedValue<PatchProps["patch"]>
    rightPatch: PatchProps["patch"] | SharedValue<PatchProps["patch"]>
    colors?: string[]
    edgeOpacity?: number
}

export const EdgeSwipeIndicator = ({
    canvasSize,
    swipeDirection,
    colors,
    leftPatch,
    rightPatch,
    edgeOpacity = 0.45,
}: EdgeSwipeIndicatorProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const patchColors = useMemo(() => {
        if (colors) return colors

        if (theme.isDark) {
            return [
                COLORS.DARK_PURPLE_DISABLED,
                COLORS.DARK_PURPLE_DISABLED,
                COLORS.DARK_PURPLE_DISABLED,
                COLORS.DARK_PURPLE_DISABLED,
            ]
        }
        return [COLORS.GREY_50, COLORS.GREY_100, COLORS.GREY_100, COLORS.GREY_100]
    }, [colors, theme.isDark])

    const leftPatchOpacity = useDerivedValue(() => {
        return swipeDirection.value === "left" ? 1 : 0
    })

    const rightPatchOpacity = useDerivedValue(() => {
        return swipeDirection.value === "right" ? 1 : 0
    })

    return (
        <Canvas style={[styles.canvas, { width: canvasSize.width, height: canvasSize.height, opacity: edgeOpacity }]}>
            {/* Left edge bulge (when swiping right) */}
            <Group opacity={leftPatchOpacity}>
                <Patch colors={patchColors} patch={leftPatch} />
            </Group>
            {/* Right edge bulge (when swiping left) */}
            <Group opacity={rightPatchOpacity}>
                <Patch colors={patchColors} patch={rightPatch} />
            </Group>
        </Canvas>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        canvas: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
        },
    })
