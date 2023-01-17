import React, { useCallback, useEffect } from "react"
import {
    Biometrics,
    AuthenticationType as AuthType,
    SecurityLevel as SCLevel,
} from "~Common"
import { useI18nContext } from "~i18n"

const Security = () => {
    const { LL } = useI18nContext()

    const init = useCallback(async () => {
        let level = await Biometrics.getDeviceEnrolledLevel()
        // let isHardware = await Biometrics.getGeviceHasHardware()
        // let isEnrolled = await Biometrics.getIsDeviceEnrolled()
        let typeAvalable = await Biometrics.getBiometricTypeAvailable()

        // console.log("level", level) // SECRET
        // console.log("isHardware", isHardware) // true
        // console.log("isEnrolled", isEnrolled) // false
        // console.log("typeAvalable", typeAvalable) // FACIAL_RECOGNITION

        if (level === SCLevel.BIOMETRIC) {
            if (typeAvalable === AuthType.FACIAL_RECOGNITION) {
                return LL.FACE_ID()
            }

            if (typeAvalable === AuthType.FINGERPRINT) {
                return LL.FINGERPRINT()
            }

            return LL.IRIS()
        } else {
            return LL.DEVICE_PIN()
        }
    }, [LL])

    useEffect(() => {
        init()
    }, [init])

    return <></>
}

export default Security
