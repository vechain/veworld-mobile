import { AuthenticationType, SecurityLevel } from "expo-local-authentication"
import { useCallback, useEffect, useMemo, useState } from "react"
import { TAuthenticationType, TSecurityLevel } from "~Common/Types"
import { Biometrics } from "~Common/Utils"
import {
    AuthenticationType as AuthType,
    SecurityLevel as SCLevel,
} from "~Common/Enums"
import { useI18nContext } from "~i18n"

/*
    Curernt biometrics availabilty check logic

        if it has hardware AND
            it has already enrolled
                Ask to auth

        else if
            Not enrolled yet OR
            Doesn't have hardware
            Erolledlevel == NONE
                use user generated password
*/

export const useCheckBiometrics = () => {
    const { LL } = useI18nContext()

    const [DeviceSecurity, setDeviceSecurity] = useState<
        TSecurityLevel | undefined
    >()
    const [SuppoertedBiometrics, setSuppoertedBiometrics] = useState<
        TAuthenticationType | undefined
    >()

    const init = useCallback(async () => {
        let level = await Biometrics.getDeviceEnrolledLevel()
        let isHardware = await Biometrics.getGeviceHasHardware()
        let isEnrolled = await Biometrics.getIsDeviceEnrolled()
        let typeAvalable = await Biometrics.getBiometricTypeAvailable()

        if (isHardware && isEnrolled && level !== SecurityLevel.NONE) {
            let leveleType = SecurityLevel[level]
            // @ts-ignore // compiler misses enum for some reason
            let bioType = AuthenticationType[typeAvalable]
            setDeviceSecurity(leveleType as TSecurityLevel)
            setSuppoertedBiometrics(bioType)
        }
    }, [])

    useEffect(() => {
        init()
    }, [init])

    const getBiometricsType = useMemo(() => {
        if (DeviceSecurity === SCLevel.BIOMETRIC) {
            if (SuppoertedBiometrics === AuthType.FACIAL_RECOGNITION) {
                return LL.FACE_ID()
            }

            if (SuppoertedBiometrics === AuthType.FINGERPRINT) {
                return LL.FINGERPRINT()
            }

            return LL.IRIS()
        } else {
            return LL.DEVICE_PIN()
        }
    }, [DeviceSecurity, LL, SuppoertedBiometrics])

    return { DeviceSecurity, getBiometricsType }
}
