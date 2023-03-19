import { useCallback, useState } from "react"
import { Linking } from "react-native"
import { Camera } from "react-native-vision-camera"

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
    const [isOpenCamera, setIsOpenCamera] = useState(false)
    const [isError, setIsError] = useState(false)

    const requestPermissions = useCallback(async () => {
        const perms = await Camera.requestCameraPermission()
        switch (perms) {
            case CameraPermissionRequestValues.authorized:
                setIsOpenCamera(true)
                return
            case CameraPermissionRequestValues.denied:
                await Linking.openSettings()
                return
            default:
                break
        }
    }, [])

    const checkPermissions = useCallback(async () => {
        const perms = await Camera.getCameraPermissionStatus()

        switch (perms) {
            case CameraPermissionStatusValues.authorized:
                setIsOpenCamera(true)
                return
            case CameraPermissionStatusValues.denied:
                await Linking.openSettings()
                return
            case CameraPermissionStatusValues.notDetermined:
                await requestPermissions()
                return
            case CameraPermissionStatusValues.restricted:
                setIsError(true)
                return
            default:
                break
        }
    }, [requestPermissions])

    return {
        checkPermissions,
        isOpenCamera,
        isError,
    }
}
