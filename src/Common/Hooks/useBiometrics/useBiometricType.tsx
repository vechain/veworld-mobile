import { useMemo } from "react"
import { PlatformUtils } from "~Common/Utils"
import { AuthenticationType, SecurityLevelType } from "~Model"
import { useI18nContext } from "~i18n"
import { useBiometrics } from "./useBiometrics"

export const useBiometricType = () => {
    const { LL } = useI18nContext()

    const biometrics = useBiometrics()

    const currentSecurityLevel = useMemo(() => {
        if (PlatformUtils.isIOS()) {
            if (
                biometrics?.currentSecurityLevel ===
                SecurityLevelType.BIOMETRICS
            ) {
                if (
                    biometrics?.authTypeAvailable ===
                    AuthenticationType.FACIAL_RECOGNITION
                ) {
                    return LL.FACE_ID()
                }
                if (
                    biometrics?.authTypeAvailable ===
                    AuthenticationType.FINGERPRINT
                ) {
                    return LL.TOUCH_ID()
                }
            } else {
                return LL.BIOMETRICS()
            }
        } else {
            if (
                biometrics?.currentSecurityLevel ===
                SecurityLevelType.BIOMETRICS
            ) {
                if (
                    biometrics?.authTypeAvailable ===
                    AuthenticationType.FACIAL_RECOGNITION
                ) {
                    return LL.FACE_ID()
                }
                if (
                    biometrics?.authTypeAvailable ===
                    AuthenticationType.FINGERPRINT
                ) {
                    return LL.FINGERPRINT()
                }
            } else {
                return LL.BIOMETRICS()
            }
        }
    }, [LL, biometrics])

    return { currentSecurityLevel }
}
