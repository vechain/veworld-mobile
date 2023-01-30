import { useMemo } from "react"
import { PlatformUtils } from "~Common/Utils"
import { AuthenticationType, SecurityLevelType } from "~Model"
import { Biometrics, useCachedQuery } from "~Storage/Realm"
import { useI18nContext } from "~i18n"

export const useBiometricType = () => {
    const { LL } = useI18nContext()

    // const biometrics = useStoreObject(Biometrics, "BIOMETRICS")
    // todo: this is a workaround until the new version is installed, then use the above
    const result = useCachedQuery(Biometrics)
    const biometrics = useMemo(() => result.sorted("_id"), [result])

    const currentSecurityLevel = useMemo(() => {
        if (PlatformUtils.isIOS()) {
            if (
                biometrics[0]?.currentSecurityLevel ===
                SecurityLevelType.BIOMETRIC
            ) {
                if (
                    biometrics[0]?.authtypeAvailable ===
                    AuthenticationType.FACIAL_RECOGNITION
                ) {
                    return LL.FACE_ID()
                }
                if (
                    biometrics[0]?.authtypeAvailable ===
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
                biometrics[0]?.currentSecurityLevel ===
                SecurityLevelType.BIOMETRIC
            ) {
                if (
                    biometrics[0]?.authtypeAvailable ===
                    AuthenticationType.FACIAL_RECOGNITION
                ) {
                    return LL.FACE_ID()
                }
                if (
                    biometrics[0]?.authtypeAvailable ===
                    AuthenticationType.FINGERPRINT
                ) {
                    return LL.FINGERPRINT()
                }
            }
        }
    }, [LL, biometrics])

    return { currentSecurityLevel }
}
