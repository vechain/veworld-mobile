import { useMemo } from "react"
import { PlatformUtils } from "~Common/Utils"
import { AuthenticationType, SecurityLevelType } from "~Model"
import { useBiometrics } from "~Storage"
import { useI18nContext } from "~i18n"

export const useBiometricType = () => {
    const { LL } = useI18nContext()

    const biometrics = useBiometrics()

    const currentSecurityLevel = useMemo(() => {
        if (PlatformUtils.isIOS()) {
            if (
                biometrics?.currentSecurityLevel === SecurityLevelType.BIOMETRIC
            ) {
                if (
                    biometrics?.authtypeAvailable ===
                    AuthenticationType.FACIAL_RECOGNITION
                ) {
                    return LL.FACE_ID()
                }
                if (
                    biometrics?.authtypeAvailable ===
                    AuthenticationType.FINGERPRINT
                ) {
                    return LL.TOUCH_ID()
                }
            } else {
                return LL.DEVICE_PIN()
            }
        }

        if (PlatformUtils.isAndroid()) {
            if (
                biometrics?.currentSecurityLevel === SecurityLevelType.BIOMETRIC
            ) {
                if (
                    biometrics?.authtypeAvailable ===
                    AuthenticationType.FACIAL_RECOGNITION
                ) {
                    return LL.FACE_ID()
                }
                if (
                    biometrics?.authtypeAvailable ===
                    AuthenticationType.FINGERPRINT
                ) {
                    return LL.FINGERPRINT()
                }
            }
        }
    }, [LL, biometrics])

    return { currentSecurityLevel }
}
