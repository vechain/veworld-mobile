import React, { useCallback, useEffect, useMemo } from "react"
import { BiometricsUtils, useAppState } from "~Common"
import { AppStateType, SecurityLevelType, TSecurityLevel } from "~Model"
import { Config, useCache, useStore, useStoreQuery } from "~Storage/Realm"

const {
    getDeviceEnrolledLevel,
    getGeviceHasHardware,
    getIsDeviceEnrolled,
    getBiometricTypeAvailable,
    isSecurityDowngrade,
    isSecurityUpgrade,
} = BiometricsUtils

export const Security = () => {
    const cache = useCache()
    const store = useStore()
    const [previousState, currentState] = useAppState()

    // const appConfig = useStoreObject(Config, "APP_STATE")
    // todo: this is a workaround until the new version is installed, then use the above
    const result1 = useStoreQuery(Config)
    const config = useMemo(() => result1.sorted("_id"), [result1])

    const checkSecurityDowngrade = useCallback(
        async (level: TSecurityLevel) => {
            const oldSecurityLevel = config[0].lastSecurityLevel

            if (oldSecurityLevel) {
                if (isSecurityDowngrade(oldSecurityLevel, level)) {
                    store.write(() => {
                        config[0].isSecurityDowngrade = true
                        config[0].lastSecurityLevel = level
                    })
                } else if (isSecurityUpgrade(oldSecurityLevel, level)) {
                    store.write(() => {
                        config[0].isSecurityDowngrade = false
                        config[0].lastSecurityLevel = level
                    })
                }
            } else {
                // this is called only the first time the app is loaded
                store.write(() => {
                    config[0].lastSecurityLevel = level
                })
            }
        },
        [config, store],
    )

    const init = useCallback(async () => {
        let level = await getDeviceEnrolledLevel()
        let isHardware = await getGeviceHasHardware()
        let isEnrolled = await getIsDeviceEnrolled()
        let typeAvalable = await getBiometricTypeAvailable()

        let accessControll =
            !isEnrolled || !isHardware || level !== SecurityLevelType.BIOMETRIC
                ? false
                : true

        cache.write(() => {
            cache.create(
                "Biometrics",
                {
                    currentSecurityLevel: level,
                    authtypeAvailable: typeAvalable,
                    isDeviceEnrolled: isEnrolled,
                    isHardwareAvailable: isHardware,
                    accessControl: accessControll,
                },
                Realm.UpdateMode.Modified,
            )
        })

        await checkSecurityDowngrade(level)
    }, [cache, checkSecurityDowngrade])

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
