import { StyleSheet } from "react-native"
import React, { useMemo } from "react"
import { useThemedStyles } from "~Hooks/useTheme"
import { Canvas, Patch, Group, PatchProps, SkImage, Image } from "@shopify/react-native-skia"
import { SharedValue, useDerivedValue } from "react-native-reanimated"
import { COLORS } from "~Constants"

export type SwipeDirection = "left" | "right" | "none"

type EdgeSwipeIndicatorProps = {
    canvasSize: { width: number; height: number }
    swipeDirection: SharedValue<SwipeDirection>
    viewImage: SkImage | null
    leftPatch: PatchProps["patch"] | SharedValue<PatchProps["patch"]>
    rightPatch: PatchProps["patch"] | SharedValue<PatchProps["patch"]>
    colors?: string[]
    edgeOpacity?: number
}

export const EdgeSwipeIndicator = ({
    canvasSize,
    swipeDirection,
    colors,
    viewImage,
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
        return swipeDirection.value === "left" ? edgeOpacity : 0
    })

    const rightPatchOpacity = useDerivedValue(() => {
        return swipeDirection.value === "right" ? edgeOpacity : 0
    })

    return (
        <Canvas style={[styles.canvas, { width: canvasSize.width, height: canvasSize.height }]}>
            <Image image={viewImage} x={0} y={0} width={viewImage?.width() ?? 0} height={viewImage?.height() ?? 0} />
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
