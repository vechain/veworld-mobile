import React, { useCallback, useEffect, useMemo } from "react"
import { BiometricsUtils, useAppState, useBiometrics } from "~Common"
import { AppStateType, TSecurityLevel, WALLET_STATUS } from "~Model"
import { Config, useObjectListener, useRealm } from "~Storage"

const { isSecurityDowngrade, isSecurityUpgrade } = BiometricsUtils

type Props = { appLockStatus: WALLET_STATUS | undefined }

export const Security = ({ appLockStatus }: Props) => {
    const { store, cache } = useRealm()
    const [previousState, currentState] = useAppState()

    const config = useObjectListener(
        Config.getName(),
        Config.getPrimaryKey(),
        store,
    ) as Config

    const lastSecurityLevel = useMemo(() => config.lastSecurityLevel, [config])

    const biometrics = useBiometrics()

    const level = useMemo(
        () => biometrics?.currentSecurityLevel as TSecurityLevel,
        [biometrics?.currentSecurityLevel],
    )

    const checkSecurityDowngrade = useCallback(async () => {
        if (lastSecurityLevel !== "NONE" && level) {
            if (isSecurityDowngrade(lastSecurityLevel, level, appLockStatus!)) {
                store.write(() => {
                    config.isSecurityDowngrade = true
                    config.lastSecurityLevel = level
                })
            } else if (
                isSecurityUpgrade(lastSecurityLevel, level, appLockStatus!)
            ) {
                store.write(() => {
                    config.isSecurityDowngrade = false
                    config.lastSecurityLevel = level
                })
            }
        } else {
            if (lastSecurityLevel && level)
                store.write(() => {
                    config.lastSecurityLevel = level
                })
        }
    }, [appLockStatus, config, lastSecurityLevel, level, store])

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
