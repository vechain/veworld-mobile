import React, { useCallback, useEffect, useMemo } from "react"
import { BiometricsUtils, useAppState } from "~Common"
import { AppStateType, TSecurityLevel } from "~Model"
import {
    Biometrics,
    Config,
    useCache,
    useCachedQuery,
    useStore,
    useStoreQuery,
} from "~Storage"

const { isSecurityDowngrade, isSecurityUpgrade } = BiometricsUtils

export const Security = () => {
    const cache = useCache()
    const store = useStore()
    const [previousState, currentState] = useAppState()

    // const appConfig = useStoreObject(Config, "APP_STATE")
    // todo: this is a workaround until the new version is installed, then use the above
    const result1 = useStoreQuery(Config)
    const config = useMemo(() => result1.sorted("_id"), [result1])

    // todo: this is a workaround until the new version is installed, then use the above
    const result2 = useCachedQuery(Biometrics)
    const biometrics = useMemo(() => result2.sorted("_id"), [result2])

    const checkSecurityDowngrade = useCallback(async () => {
        const oldSecurityLevel = config[0]?.lastSecurityLevel
        const level = biometrics[0]?.currentSecurityLevel as TSecurityLevel

        if (oldSecurityLevel !== "NONE" && level) {
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
            if (config[0]?.lastSecurityLevel && level)
                store.write(() => {
                    config[0].lastSecurityLevel = level
                })
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
