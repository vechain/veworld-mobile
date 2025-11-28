import { SCROLLABLE_STATE, useBottomSheetInternal } from "@gorhom/bottom-sheet"
import React, { forwardRef, memo } from "react"
import { RefreshControl, RefreshControlProps } from "react-native"
import { NativeViewGestureHandler } from "react-native-gesture-handler"
import Animated, { useAnimatedProps } from "react-native-reanimated"

const AnimatedRefreshControl = Animated.createAnimatedComponent(RefreshControl)

const BottomSheetRefreshControlComponent = forwardRef<NativeViewGestureHandler, RefreshControlProps>(
    ({ onRefresh, ...rest }, ref) => {
        // hooks
        const { animatedScrollableState } = useBottomSheetInternal()

        // variables
        const animatedProps = useAnimatedProps(() => ({
            enabled: animatedScrollableState.value === SCROLLABLE_STATE.UNLOCKED,
        }))

        // render
        return (
            <NativeViewGestureHandler ref={ref} shouldCancelWhenOutside={false}>
                <AnimatedRefreshControl {...rest} onRefresh={onRefresh} animatedProps={animatedProps} />
            </NativeViewGestureHandler>
        )
    },
)

const BottomSheetRefreshControl = memo(BottomSheetRefreshControlComponent)
BottomSheetRefreshControl.displayName = "BottomSheetRefreshControl"

export default BottomSheetRefreshControl
