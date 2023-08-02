import { useCallback, useEffect, useState } from "react"
import { useAppState } from "../useAppState"
import BiometricsUtils from "~Utils/BiometricsUtils" // TODO (Davide) (https://github.com/vechainfoundation/veworld-mobile/issues/748) remove this circular dependency
import { AppStateType, BiometricState, SecurityLevelType } from "~Model"
import { isEqual } from "lodash"

const {
    getDeviceEnrolledLevel,
    getDeviceHasHardware,
    getIsDeviceEnrolled,
    getBiometricTypeAvailable,
} = BiometricsUtils

/**
 * hook that returns the biometrics state
 */
export const useBiometrics = () => {
    const { previousState, currentState } = useAppState()
    const [biometrics, setBiometrics] = useState<BiometricState | undefined>()

    const init = useCallback(async () => {
        const level = await getDeviceEnrolledLevel()

        const isHardware = await getDeviceHasHardware()
        const isEnrolled = await getIsDeviceEnrolled()
        const typeAvailable = await getBiometricTypeAvailable()

        const accessControl =
            isEnrolled && isHardware && level === SecurityLevelType.BIOMETRIC

        const obj: BiometricState = {
            currentSecurityLevel: level,
            authTypeAvailable: typeAvailable,
            isDeviceEnrolled: isEnrolled,
            isHardwareAvailable: isHardware,
            accessControl: accessControl,
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
