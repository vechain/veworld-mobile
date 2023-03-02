import React, { useCallback, useEffect, useMemo } from "react"
import { BiometricsUtils, useAppState, useBiometrics } from "~Common"
import {
    AppStateType,
    TSecurityLevel,
    UserSelectedSecurityLevel,
    WALLET_STATUS,
} from "~Model"
import { Config, useRealm } from "~Storage"

const { isSecurityDowngrade, isSecurityUpgrade } = BiometricsUtils

type Props = { appLockStatus: WALLET_STATUS | undefined }

export const Security = ({ appLockStatus }: Props) => {
    const { store } = useRealm()
    const [previousState, currentState] = useAppState()

    const biometrics = useBiometrics()

    const level = useMemo(
        () => biometrics?.currentSecurityLevel as TSecurityLevel,
        [biometrics?.currentSecurityLevel],
    )

    const checkSecurityDowngrade = useCallback(async () => {
        const config = store.objectForPrimaryKey<Config>(
            Config.getName(),
            Config.getPrimaryKey(),
        ) as Config

        const lastSecurityLevel = config.lastSecurityLevel

        if (config.userSelectedSecurity === UserSelectedSecurityLevel.PASSWORD)
            return

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
            if (level)
                store.write(() => {
                    config.lastSecurityLevel = level
                })
        }
    }, [appLockStatus, level, store])

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
    }, [currentState, init, previousState])

    return <></>
}
