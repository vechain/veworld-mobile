import { useCallback, useEffect, useState } from "react"
import { Linking } from "react-native"
import { AlertUtils } from "~Utils"
import { useAppState } from "../useAppState"
import { AppStateType } from "~Model"
import { Camera } from "expo-camera"
import { useI18nContext } from "~i18n"

/**
 * hook to check and request camera permissions
 */
export const useCameraPermissions = () => {
    const { LL } = useI18nContext()
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
            let title = LL.TITLE_ALERT_CAMERA_PERMISSION()
            let msg = LL.SB_ALERT_CAMERA_PERMISSION()

            AlertUtils.showGoToSettingsAlert(
                title,
                msg,
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
    }, [LL, requestPermissions])

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
