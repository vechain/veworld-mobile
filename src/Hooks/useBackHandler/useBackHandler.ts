import { useCallback, useEffect } from "react"
import { BackHandler } from "react-native"
import { BackHandlerEvent } from "~Model"

export const useBackHandler = (backHandlerEvent: BackHandlerEvent) => {
    const onHardwareBackPressCallBack = useCallback(() => {
        return backHandlerEvent === BackHandlerEvent.BLOCK
    }, [backHandlerEvent])

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", onHardwareBackPressCallBack)

        return () => backHandler.remove()
    }, [onHardwareBackPressCallBack])
}
