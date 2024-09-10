import { useCallback, useRef } from "react"
import { BackHandler, NativeEventSubscription } from "react-native"
import { BackHandlerEvent } from "~Model"

export const useBackHandler = (backHandlerEvent: BackHandlerEvent) => {
    const nativeBackHandlerSubscription = useRef<NativeEventSubscription | null>(null)

    const onHardwareBackPressCallBack = useCallback(() => {
        return backHandlerEvent === BackHandlerEvent.BLOCK
    }, [backHandlerEvent])

    const addBackHandlerListener = useCallback(() => {
        if (!nativeBackHandlerSubscription.current) {
            nativeBackHandlerSubscription.current = BackHandler.addEventListener(
                "hardwareBackPress",
                onHardwareBackPressCallBack,
            )
        }
    }, [onHardwareBackPressCallBack])

    const removeBackHandlerListener = useCallback(() => {
        nativeBackHandlerSubscription.current?.remove()
        nativeBackHandlerSubscription.current = null
    }, [])

    return { addBackHandlerListener, removeBackHandlerListener }
}
