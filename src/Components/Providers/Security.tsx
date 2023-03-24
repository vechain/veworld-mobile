import React, { useCallback, useEffect, useMemo } from "react"
import { BiometricsUtils, useAppState, useBiometrics } from "~Common"
import {
    AppStateType,
    SecurityLevelType,
    TSecurityLevel,
    UserSelectedSecurityLevel,
    WALLET_STATUS,
} from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    setIsSecurityDowngrade,
    setLastSecurityLevel,
} from "~Storage/Redux/Actions"
import {
    selectLastSecuritylevel,
    selectUserSelectedSecurity,
} from "~Storage/Redux/Selectors"

type Props = { appLockStatus: WALLET_STATUS | undefined }

export const Security = ({ appLockStatus }: Props) => {
    const [previousState, currentState] = useAppState()
    const biometrics = useBiometrics()

    const dispatch = useAppDispatch()
    const lastSecurityLevel = useAppSelector(selectLastSecuritylevel)
    const userSelectedSecurity = useAppSelector(selectUserSelectedSecurity)

    const level = useMemo(
        () => biometrics?.currentSecurityLevel as TSecurityLevel,
        [biometrics?.currentSecurityLevel],
    )

    const checkSecurityDowngrade = useCallback(async () => {
        if (userSelectedSecurity === UserSelectedSecurityLevel.PASSWORD) return

        if (lastSecurityLevel !== SecurityLevelType.NONE && level) {
            if (
                BiometricsUtils.isSecurityDowngrade(
                    lastSecurityLevel,
                    level,
                    appLockStatus!,
                )
            ) {
                dispatch(setIsSecurityDowngrade(true))
                dispatch(setLastSecurityLevel(level))
            } else if (
                BiometricsUtils.isSecurityUpgrade(
                    lastSecurityLevel,
                    level,
                    appLockStatus!,
                )
            ) {
                dispatch(setIsSecurityDowngrade(false))
                dispatch(setLastSecurityLevel(level))
            }
        } else {
            if (level) dispatch(setLastSecurityLevel(level))
        }
    }, [
        appLockStatus,
        dispatch,
        lastSecurityLevel,
        level,
        userSelectedSecurity,
    ])

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
