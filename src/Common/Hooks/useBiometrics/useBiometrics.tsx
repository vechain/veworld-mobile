import { useCallback, useEffect, useState } from "react"
import { useAppState } from "../useAppState"
import { BiometricsUtils } from "~Common/Utils"
import { AppStateType, BiometricState, SecurityLevelType } from "~Model"
import { isEqual } from "lodash"

const {
    getDeviceEnrolledLevel,
    getDeviceHasHardware,
    getIsDeviceEnrolled,
    getBiometricTypeAvailable,
} = BiometricsUtils

export const useBiometrics = () => {
    const [previousState, currentState] = useAppState()
    const [biometrics, setBiometrics] = useState<BiometricState | undefined>()

    const init = useCallback(async () => {
        let level = await getDeviceEnrolledLevel()
        let isHardware = await getDeviceHasHardware()
        let isEnrolled = await getIsDeviceEnrolled()
        let typeAvalable = await getBiometricTypeAvailable()

        let accessControl =
            isEnrolled && isHardware && level === SecurityLevelType.BIOMETRIC

        const obj = {
            currentSecurityLevel: level,
            authtypeAvailable: typeAvalable,
            isDeviceEnrolled: isEnrolled,
            isHardwareAvailable: isHardware,
            accessControl: accessControl,
        }

        if (!biometrics) {
            setBiometrics({ ...obj })
        }

        // lodash utility function - deep compare objects - exit early if no changes occur
        if (isEqual(biometrics, obj)) return

        setBiometrics({ ...obj })
    }, [biometrics])

    useEffect(() => {
        if (
            currentState === AppStateType.ACTIVE &&
            previousState !== AppStateType.INACTIVE
        ) {
            init()
        }
    }, [currentState, init, previousState])

    return { ...biometrics }
}
