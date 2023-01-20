import { useEffect, useState } from "react"
import { LocalizedString } from "typesafe-i18n"
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
    const isBiometrics = useAppSelector(selectIsBiometrics)

    const [biometricType, setBiometricType] = useState<LocalizedString>(
        LL.FACE_ID(),
    )

    useEffect(() => {
        if (PlatformUtils.isIOS()) {
            if (level === SecurityLevelType.BIOMETRIC) {
                if (typeAvalable === AuthenticationType.FACIAL_RECOGNITION) {
                    setBiometricType(LL.FACE_ID())
                }

                if (typeAvalable === AuthenticationType.FINGERPRINT) {
                    setBiometricType(LL.TOUCH_ID())
                }
            } else {
                setBiometricType(LL.DEVICE_PIN())
            }
        }

        if (PlatformUtils.isAndroid()) {
            if (level === SecurityLevelType.BIOMETRIC) {
                if (typeAvalable === AuthenticationType.FACIAL_RECOGNITION) {
                    setBiometricType(LL.FACE_ID())
                }

                if (typeAvalable === AuthenticationType.FINGERPRINT) {
                    setBiometricType(LL.FINGERPRINT())
                }
            }
        }
    }, [LL, level, typeAvalable])

    return { isBiometrics, biometricType }
}
