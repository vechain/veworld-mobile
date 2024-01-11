import { useCallback, useEffect, useState } from "react"
import { Linking, PermissionsAndroid, Platform } from "react-native"
import DeviceInfo from "react-native-device-info"

export const LedgerAndroidPermissions = () => {
    const [androidPermissionsGranted, setAndroidPermissionsGranted] = useState(false)
    const [firstNeverAskAgain, setFirstNeverAskAgain] = useState(true)

    const checkPermissions = useCallback(
        async (fromUseEffect = false) => {
            if (Platform.OS === "android") {
                let permissionResponses = {}

                /*
                    No need to request permissions if the api is lower than 31
                */
                // https://stackoverflow.com/a/76321476/7977491
                if (DeviceInfo.getApiLevelSync() > 30) {
                    permissionResponses = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    ])
                } else {
                    permissionResponses = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    ])
                }

                const permissionStatuses = Object.values(permissionResponses)
                const allGranted = permissionStatuses.every(status => status === PermissionsAndroid.RESULTS.GRANTED)

                if (allGranted) {
                    setAndroidPermissionsGranted(true)
                    return
                }

                setAndroidPermissionsGranted(false)

                /** https://developer.android.com/about/versions/11/privacy/permissions#dialog-visibility */
                const someNeverAskAgain = permissionStatuses.some(
                    status => status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
                )

                if (someNeverAskAgain) {
                    if (!firstNeverAskAgain && !fromUseEffect) {
                        await Linking.openSettings()
                    } else {
                        setFirstNeverAskAgain(false)
                    }
                }
            }
        },
        [firstNeverAskAgain],
    )

    useEffect(() => {
        checkPermissions(true)
    }, [checkPermissions])

    return {
        androidPermissionsGranted,
        checkPermissions,
    }
}
