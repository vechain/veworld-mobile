import { useCallback, useEffect, useState } from "react"
import { Linking } from "react-native"
import { AlertUtils } from "~Common/Utils"
import { useAppState } from "./useAppState"
import { AppStateType } from "~Model"
import { Camera } from "expo-camera"

export const useCameraPermissions = () => {
    const [hasPerms, setHasPerms] = useState(false)
    const [isCanceled, setIsCanceled] = useState(false)
    const [previousState, currentState] = useAppState()

    const requestPermissions = useCallback(async () => {
        const status = await Camera.requestCameraPermissionsAsync()

        if (status?.granted) {
            setHasPerms(true)
            return
        }

        if (!status?.granted && !status?.canAskAgain) {
            setIsCanceled(true)
            return
        }
    }, [])

    const checkPermissions = useCallback(async () => {
        const status = await Camera.getCameraPermissionsAsync()

        if (status?.granted) {
            setHasPerms(true)
            return
        }

        if (!status?.granted && !status?.canAskAgain) {
            AlertUtils.showGoToSettingsCameraAlert(
                () => {
                    setIsCanceled(true)
                    return
                },
                async () => {
                    await Linking.openSettings()
                },
            )
            return
        }

        if (status.canAskAgain) {
            await requestPermissions()
            return
        }
    }, [requestPermissions])

    useEffect(() => {
        async function init() {
            if (
                currentState === AppStateType.ACTIVE &&
                previousState === AppStateType.BACKGROUND
            ) {
                checkPermissions()
            }
        }
        init()
    }, [checkPermissions, currentState, previousState])

    return { checkPermissions, hasPerms, isCanceled }
}
