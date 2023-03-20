import { useCallback } from "react"
import { Linking } from "react-native"
import { Camera } from "react-native-vision-camera"
import { AlertUtils } from "~Common/Utils"
import * as i18n from "~i18n"

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
    const requestPermissions = useCallback(async () => {
        const perms = await Camera.requestCameraPermission()
        switch (perms) {
            case CameraPermissionRequestValues.authorized:
                return true
            case CameraPermissionRequestValues.denied:
                return
            default:
                break
        }
    }, [])

    const checkPermissions = useCallback(async () => {
        const perms = await Camera.getCameraPermissionStatus()

        switch (perms) {
            case CameraPermissionStatusValues.authorized:
                return true
            case CameraPermissionStatusValues.denied:
                AlertUtils.showGoToSettingsCameraAlert(
                    () => {
                        //  onCancell
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
                return
            default:
                break
        }
    }, [requestPermissions])

    return { checkPermissions }
}
