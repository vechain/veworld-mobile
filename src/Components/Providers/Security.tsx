import React, { useCallback, useEffect } from "react"
import { BiometricsUtils, useAppState } from "~Common"
import { AppStateType, TSecurityLevel } from "~Model"
import { useBiometrics, useConfig, useRealm } from "~Storage"

const { isSecurityDowngrade, isSecurityUpgrade } = BiometricsUtils

export const Security = () => {
    const { store, cache } = useRealm()
    const [previousState, currentState] = useAppState()

    const config = useConfig()
    const biometrics = useBiometrics()
    console.log({ config }, { biometrics })

    const checkSecurityDowngrade = useCallback(async () => {
        const oldSecurityLevel = config?.lastSecurityLevel
        const level = biometrics?.currentSecurityLevel as TSecurityLevel

        if (config) {
            if (oldSecurityLevel !== "NONE" && level) {
                if (isSecurityDowngrade(oldSecurityLevel!, level)) {
                    store.write(() => {
                        config.isSecurityDowngrade = true
                        config.lastSecurityLevel = level
                    })
                } else if (isSecurityUpgrade(oldSecurityLevel!, level)) {
                    store.write(() => {
                        config.isSecurityDowngrade = false
                        config.lastSecurityLevel = level
                    })
                } else {
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
    }, [biometrics, config, store])

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
