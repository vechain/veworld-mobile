import { useMemo } from "react"
import { PlatformUtils } from "~Common/Utils"
import { AuthenticationType, SecurityLevelType } from "~Model"
import {
    selectAvailableAuthType,
    selectIsBiometrics,
    selectSecurityLevel,
    useAppSelector,
} from "~Storage/Caches"
import { useI18nContext } from "~i18n"

export const useBiometricType = () => {
    const { LL } = useI18nContext()
    const level = useAppSelector(selectSecurityLevel)
    const typeAvalable = useAppSelector(selectAvailableAuthType)
    const _isBiometrics = useAppSelector(selectIsBiometrics)

    const isBiometrics = useMemo(() => {
        if (PlatformUtils.isIOS() && level !== SecurityLevelType.NONE) {
            return true
        } else if (PlatformUtils.isAndroid() && _isBiometrics) {
            return true
        } else {
            return false
        }
    }, [_isBiometrics, level])

    const currentSecurityLevel = useMemo(() => {
        if (PlatformUtils.isIOS()) {
            if (level === SecurityLevelType.BIOMETRIC) {
                if (typeAvalable === AuthenticationType.FACIAL_RECOGNITION) {
                    return LL.FACE_ID()
                }
                if (typeAvalable === AuthenticationType.FINGERPRINT) {
                    return LL.TOUCH_ID()
                }
            } else {
                return LL.DEVICE_PIN()
            }
        }

        if (PlatformUtils.isAndroid()) {
            if (level === SecurityLevelType.BIOMETRIC) {
                if (typeAvalable === AuthenticationType.FACIAL_RECOGNITION) {
                    return LL.FACE_ID()
                }
                if (typeAvalable === AuthenticationType.FINGERPRINT) {
                    return LL.FINGERPRINT()
                }
            }
        }
    }, [LL, level, typeAvalable])

    return { isBiometrics, currentSecurityLevel }
}
