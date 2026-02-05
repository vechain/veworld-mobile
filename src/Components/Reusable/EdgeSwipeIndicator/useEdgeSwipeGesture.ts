import { PatchProps, SkSize, vec } from "@shopify/react-native-skia"
import { useMemo } from "react"
import { Gesture } from "react-native-gesture-handler"
import { runOnJS, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated"
import { SwipeDirection } from "./EdgeSwipeIndicator"

type UseEdgeSwipeGestureProps = {
    onSwipeLeft: () => void
    onSwipeRight: () => void
    canvasSize: SkSize
    /**
     * The threshold for the gesture to be activated.
     * @default 10
     */
    activationThreshold?: number
}

const GESTURE_ACTIVE_THRESHOLD = 10

export const useEdgeSwipeGesture = ({
    canvasSize,
    onSwipeLeft,
    onSwipeRight,
    activationThreshold = GESTURE_ACTIVE_THRESHOLD,
}: UseEdgeSwipeGestureProps) => {
    const swipeDirection = useSharedValue<SwipeDirection>("none")
    const tx = useSharedValue(0)
    const ty = useSharedValue(0)

    const leftPatch = useDerivedValue<PatchProps["patch"]>(() => {
        const dragX = Math.max(0, tx.value)
        const fingerY = Math.min(Math.max(50, ty.value), canvasSize.height - 50)

        // Bulge parameters
        const maxBulge = 60
        const bulgeWidth = Math.min(dragX * 0.5, maxBulge)
        const bulgeSpread = 120 // How tall the bulge area is

        // Calculate control points that create the bulge at finger position
        const topLeft = {
            pos: vec(0, 0),
            c1: vec(0, 0),
            c2: vec(0, 0),
        }

        const topRight = {
            pos: vec(0, 0),
            c1: vec(0, 0),
            // Curve toward the bulge peak
            c2: vec(bulgeWidth, fingerY - bulgeSpread / 2),
        }

        const bottomRight = {
            pos: vec(0, canvasSize.height),
            // Curve from the bulge peak
            c1: vec(bulgeWidth, fingerY + bulgeSpread / 2),
            c2: vec(0, canvasSize.height),
        }

        const bottomLeft = {
            pos: vec(0, canvasSize.height),
            c1: vec(0, canvasSize.height),
            c2: vec(0, canvasSize.height),
        }

        return [topLeft, topRight, bottomRight, bottomLeft]
    }, [canvasSize, tx, ty])

    const rightPatch = useDerivedValue<PatchProps["patch"]>(() => {
        const dragX = Math.max(0, tx.value)
        const fingerY = Math.min(Math.max(50, ty.value), canvasSize.height - 50)

        const maxBulge = 60
        const bulgeWidth = Math.min(dragX * 0.5, maxBulge)
        const bulgeSpread = 120

        const width = canvasSize.width

        const topLeft = {
            pos: vec(width, 0),
            // c1: INCOMING from bottomLeft - THIS creates the upper part of the bulge
            c1: vec(width - bulgeWidth, fingerY - bulgeSpread / 2),
            // c2: outgoing to topRight - straight edge (no curve)
            c2: vec(width, 0),
        }

        const topRight = {
            pos: vec(width, 0),
            c1: vec(width, 0),
            c2: vec(width, 0),
        }

        const bottomRight = {
            pos: vec(width, canvasSize.height),
            c1: vec(width, canvasSize.height),
            c2: vec(width, canvasSize.height),
        }

        const bottomLeft = {
            pos: vec(width, canvasSize.height),
            // c1: incoming from bottomRight - straight edge
            c1: vec(width, canvasSize.height),
            // c2: OUTGOING to topLeft - THIS creates the lower part of the bulge
            c2: vec(width - bulgeWidth, fingerY + bulgeSpread / 2),
        }

        return [topLeft, topRight, bottomRight, bottomLeft]
    }, [canvasSize, tx, ty])

    const swipeGesture = useMemo(() => {
        let startX = 0
        return Gesture.Pan()
            .onBegin(({ translationX }) => {
                startX = translationX
            })
            .onUpdate(({ y, translationX }) => {
                // Determine swipe direction and set values accordingly
                if (translationX > 0) {
                    // Swiping right (finger moving right) → show LEFT edge bulge
                    swipeDirection.value = "left"
                    tx.value = withSpring(translationX, { damping: 90, stiffness: 500 })
                    ty.value = withSpring(y, { damping: 90, stiffness: 500 })
                } else if (translationX < 0) {
                    // Swiping left (finger moving left) → show RIGHT edge bulge
                    swipeDirection.value = "right"
                    tx.value = withSpring(Math.abs(translationX), { damping: 90, stiffness: 500 })
                    ty.value = withSpring(y, { damping: 90, stiffness: 500 })
                }
            })
            .onEnd(({ translationX }) => {
                tx.value = withSpring(0, { damping: 15, stiffness: 150 })
                swipeDirection.value = "none"

                if (startX > translationX) {
                    runOnJS(onSwipeLeft)()
                    return
                }

                if (startX < translationX) {
                    runOnJS(onSwipeRight)()
                }
            })
            .activeOffsetX([-activationThreshold, activationThreshold])
    }, [onSwipeLeft, onSwipeRight, tx, ty, swipeDirection, activationThreshold])

    return useMemo(
        () => ({
            swipeDirection,
            leftPatch,
            rightPatch,
            swipeGesture,
        }),
        [swipeDirection, leftPatch, rightPatch, swipeGesture],
    )
}
