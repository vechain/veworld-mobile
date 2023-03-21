import React, { useCallback, useEffect, useMemo } from "react"
import { BiometricsUtils, useAppState, useBiometrics } from "~Common"
import {
    AppStateType,
    TSecurityLevel,
    UserSelectedSecurityLevel,
    WALLET_STATUS,
} from "~Model"
import { getConfig, useRealm } from "~Storage"

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
        const config = getConfig(store)

        const lastSecurityLevel = config.lastSecurityLevel

        if (config.userSelectedSecurity === UserSelectedSecurityLevel.PASSWORD)
            return

        if (lastSecurityLevel !== "NONE" && level) {
            if (
                BiometricsUtils.isSecurityDowngrade(
                    lastSecurityLevel,
                    level,
                    appLockStatus!,
                )
            ) {
                store.write(() => {
                    config.isSecurityDowngrade = true
                    config.lastSecurityLevel = level
                })
            } else if (
                BiometricsUtils.isSecurityUpgrade(
                    lastSecurityLevel,
                    level,
                    appLockStatus!,
                )
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
