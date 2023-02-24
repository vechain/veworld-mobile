import React, { useCallback, useEffect } from "react"
import {
    BiometricsUtils,
    useAppLock,
    useAppState,
    useBiometrics,
} from "~Common"
import { AppStateType, TSecurityLevel } from "~Model"
import { Config, useObjectListener, useRealm } from "~Storage"

const { isSecurityDowngrade, isSecurityUpgrade } = BiometricsUtils

export const Security = () => {
    const { store, cache } = useRealm()
    const [previousState, currentState] = useAppState()
    const { appLockStatus } = useAppLock()

    const config = useObjectListener(
        Config.getName(),
        Config.getPrimaryKey(),
        store,
    ) as Config

    const biometrics = useBiometrics()

    const checkSecurityDowngrade = useCallback(async () => {
        const oldSecurityLevel = config?.lastSecurityLevel
        const level = biometrics?.currentSecurityLevel as TSecurityLevel

        if (config) {
            if (oldSecurityLevel !== "NONE" && level) {
                if (
                    isSecurityDowngrade(oldSecurityLevel, level, appLockStatus!)
                ) {
                    store.write(() => {
                        config.isSecurityDowngrade = true
                        config.lastSecurityLevel = level
                    })
                } else if (
                    isSecurityUpgrade(oldSecurityLevel, level, appLockStatus!)
                ) {
                    store.write(() => {
                        config.isSecurityDowngrade = false
                        config.lastSecurityLevel = level
                    })
                }
            } else {
                if (config?.lastSecurityLevel && level)
                    store.write(() => {
                        config.lastSecurityLevel = level
                    })
            }
        }
    }, [appLockStatus, biometrics?.currentSecurityLevel, config, store])

    const init = useCallback(async () => {
        checkSecurityDowngrade()
    }, [checkSecurityDowngrade])

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
