import { useCallback } from "react"
import { Linking } from "react-native"
import { AlertUtils, debug } from "~Utils"
import { Camera } from "expo-camera"
import { useI18nContext } from "~i18n"

/**
 * hook to check and request camera permissions
 */
export const useCameraPermissions = ({
    onCanceled,
}: {
    onCanceled: () => void
}) => {
    const { LL } = useI18nContext()

    const requestPermissions = useCallback(async (): Promise<boolean> => {
        const status = await Camera.requestCameraPermissionsAsync()

        debug(`requestPermissions: ${JSON.stringify(status)}`)

        if (status.granted) {
            return true
        }

        if (!status.canAskAgain) {
            onCanceled()
        }

        return false
    }, [onCanceled])

    const checkPermissions = useCallback(async (): Promise<boolean> => {
        const status = await Camera.getCameraPermissionsAsync()

        debug(`checkPermissions: ${JSON.stringify(status)}`)

        if (status.granted) {
            return true
        }

        if (status.canAskAgain) {
            return await requestPermissions()
        } else {
            AlertUtils.showGoToSettingsAlert(
                LL.TITLE_ALERT_CAMERA_PERMISSION(),
                LL.SB_ALERT_CAMERA_PERMISSION(),
                () => {
                    return onCanceled()
                },
                async () => {
                    await Linking.openSettings()
                },
            )
        }

        return false
    }, [LL, requestPermissions, onCanceled])

    return { checkPermissions }
}
