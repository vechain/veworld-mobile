import { Portal } from "@gorhom/portal"
import React, { forwardRef, PropsWithChildren, useImperativeHandle } from "react"
import { StyleSheet } from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { SCREEN_HEIGHT } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseView } from "../BaseView"
import { BaseBottomSheetV2Provider, useBaseBottomSheetV2 } from "./BaseBottomSheetV2Provider"

export type BaseBottomSheetV2Ref = {
    present: (data?: unknown) => void
    close: () => void
}

const _BaseBottomSheetV2Root = forwardRef<BaseBottomSheetV2Ref, PropsWithChildren>(function _BaseBottomSheetV2Root(
    { children },
    ref,
) {
    const { open, onOpen, onClose } = useBaseBottomSheetV2()
    const { styles } = useThemedStyles(baseStyles)
    const rootAnimatedStyles = useAnimatedStyle(() => {
        return {
            top: open.value ? 0 : SCREEN_HEIGHT,
            left: 0,
            zIndex: open.value ? 1000 : -1,
        }
    }, [open])

    useImperativeHandle(ref, () => ({ present: onOpen, close: onClose }))

    return (
        <Animated.View style={[StyleSheet.absoluteFillObject, rootAnimatedStyles]}>
            <BaseView flexGrow={1} style={styles.root} bg="transparent" position="relative">
                {children}
            </BaseView>
        </Animated.View>
    )
})

type Props = PropsWithChildren<{ onDismiss?: () => void; snapPoints?: (`${number}%` | number)[] }>

export const BaseBottomSheetV2Root = forwardRef<BaseBottomSheetV2Ref, Props>(function BaseBottomSheetV2Root(
    { children, onDismiss, snapPoints },
    ref,
) {
    return (
        <Portal>
            <BaseBottomSheetV2Provider onDismiss={onDismiss} snapPoints={snapPoints}>
                <_BaseBottomSheetV2Root ref={ref}>{children}</_BaseBottomSheetV2Root>
            </BaseBottomSheetV2Provider>
        </Portal>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        root: {
            justifyContent: "flex-end",
        },
    })
