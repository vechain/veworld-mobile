import React, { useCallback, useEffect } from "react"
import { BiometricsUtils, useAppState } from "~Common"
import { AppStateType, SecurityLevelType } from "~Model"
import { useCache, Biometrics as RealmBiometrics } from "~Storage"

const {
    getDeviceEnrolledLevel,
    getDeviceHasHardware,
    getIsDeviceEnrolled,
    getBiometricTypeAvailable,
} = BiometricsUtils

export const Biometrics = () => {
    const cache = useCache()
    const [previousState, currentState] = useAppState()

    const init = useCallback(async () => {
        let level = await getDeviceEnrolledLevel()
        let isHardware = await getDeviceHasHardware()
        let isEnrolled = await getIsDeviceEnrolled()
        let typeAvalable = await getBiometricTypeAvailable()

        let accessControl =
            isEnrolled && isHardware && level === SecurityLevelType.BIOMETRIC

        cache.write(() => {
            cache.create(
                RealmBiometrics.getName(),
                {
                    _id: "BIOMETRICS",
                    currentSecurityLevel: level,
                    authtypeAvailable: typeAvalable,
                    isDeviceEnrolled: isEnrolled,
                    isHardwareAvailable: isHardware,
                    accessControl: accessControl,
                },
                Realm.UpdateMode.All,
            )
        })
    }, [cache])

    useEffect(() => {
        if (
            currentState === AppStateType.ACTIVE &&
            previousState !== AppStateType.INACTIVE
        ) {
            init()
        }
    }, [cache, currentState, init, previousState])

    return <></>
}
