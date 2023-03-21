import { useCallback, useEffect, useState } from "react"
import { Linking } from "react-native"
import { Camera } from "react-native-vision-camera"
import { AlertUtils } from "~Common/Utils"
import * as i18n from "~i18n"
import { useAppState } from "./useAppState"
import { AppStateType } from "~Model"

enum CameraPermissionStatusValues {
    authorized = "authorized", // Your app is authorized to use said permission.
    notDetermined = "not-determined", // Your app has not yet requested permission from the user. Continue by calling the request functions.
    restricted = "restricted", // (iOS only) Your app cannot use the Camera
    denied = "denied", // Your app has already requested permissions from the user, but was explicitly denied. You cannot use the request functions again, but you can use the Linking API to redirect the user to the Settings App where he can manually grant the permission.
}
enum CameraPermissionRequestValues {
    authorized = "authorized",
    denied = "denied",
}

export const useCameraPermissions = () => {
    const [hasPerms, setHasPerms] = useState(false)
    const [isCanceled, setIsCanceled] = useState(false)
    const [previousState, currentState] = useAppState()

    const requestPermissions = useCallback(async () => {
        const perms = await Camera.requestCameraPermission()
        switch (perms) {
            case CameraPermissionRequestValues.authorized:
                setHasPerms(true)
                return
            case CameraPermissionRequestValues.denied:
                setIsCanceled(true)
                return
            default:
                return
        }
    }, [])

    const checkPermissions = useCallback(async () => {
        const perms = await Camera.getCameraPermissionStatus()

        switch (perms) {
            case CameraPermissionStatusValues.authorized:
                setHasPerms(true)
                return
            case CameraPermissionStatusValues.denied:
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
            case CameraPermissionStatusValues.notDetermined:
                await requestPermissions()
                return
            case CameraPermissionStatusValues.restricted:
                const locale = i18n.detectLocale()
                let title = i18n.i18n()[locale].TITLE_ALERT_CAMERA_UNAVAILABLE()
                let msg = i18n.i18n()[locale].SB_CAMERA_ANAVAILABILITY()
                let buttonTitle = i18n.i18n()[locale].COMMON_BTN_OK()
                AlertUtils.showDefaultAlert(title, msg, buttonTitle)
                setIsCanceled(true)
                return
            default:
                break
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
