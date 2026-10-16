import { SCROLLABLE_STATUS, useBottomSheetInternal } from "@gorhom/bottom-sheet"
import React, { ComponentType, forwardRef, memo } from "react"
import { RefreshControl, RefreshControlProps } from "react-native"
import { NativeViewGestureHandler } from "react-native-gesture-handler"
import Animated, { useAnimatedProps } from "react-native-reanimated"

const AnimatedRefreshControl = Animated.createAnimatedComponent(RefreshControl)

const BottomSheetRefreshControlComponent = forwardRef<ComponentType | undefined | null, RefreshControlProps>(
    ({ onRefresh, ...rest }, ref) => {
        // hooks
        const { animatedScrollableStatus } = useBottomSheetInternal()

        // variables
        const animatedProps = useAnimatedProps(() => ({
            enabled: animatedScrollableStatus.value === SCROLLABLE_STATUS.UNLOCKED,
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
