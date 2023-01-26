import React, { useCallback, useEffect } from "react"
import { AsyncStoreType, BiometricsUtils } from "~Common"
import { AppStateType, TSecurityLevel } from "~Model"
import {
    selectCurrentAppState,
    selectPreviousAppState,
    setBiometrics,
    setSecurtyDowngrade,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Caches"
import { AsyncStore } from "~Storage/Stores"

const {
    getDeviceEnrolledLevel,
    getGeviceHasHardware,
    getIsDeviceEnrolled,
    getBiometricTypeAvailable,
    isSecurityDowngrade,
    isSecurityUpgrade,
} = BiometricsUtils

export const Security = () => {
    const dispatch = useAppDispatch()
    const currentAppState = useAppSelector(selectCurrentAppState)
    const previousAppState = useAppSelector(selectPreviousAppState)

    const checkSecurityDowngrade = useCallback(
        async (level: TSecurityLevel) => {
            const oldSecurityLevel = await AsyncStore.getFor<string>(
                AsyncStoreType.IsSecurityDowngrade,
            )

            if (oldSecurityLevel) {
                if (isSecurityDowngrade(oldSecurityLevel, level)) {
                    dispatch(setSecurtyDowngrade(true))
                    await AsyncStore.set(
                        level,
                        AsyncStoreType.IsSecurityDowngrade,
                    )
                } else if (isSecurityUpgrade(oldSecurityLevel, level)) {
                    dispatch(setSecurtyDowngrade(false))
                    await AsyncStore.set(
                        level,
                        AsyncStoreType.IsSecurityDowngrade,
                    )
                }
            } else {
                // this is called only the first time the app is loaded
                await AsyncStore.set(level, AsyncStoreType.IsSecurityDowngrade)
            }
        },
        [dispatch],
    )

    const init = useCallback(async () => {
        let level = await getDeviceEnrolledLevel()
        let isHardware = await getGeviceHasHardware()
        let isEnrolled = await getIsDeviceEnrolled()
        let typeAvalable = await getBiometricTypeAvailable()

        dispatch(
            setBiometrics({
                currentSecurityLevel: level,
                authtypeAvailable: typeAvalable,
                isDeviceEnrolled: isEnrolled,
                isHardwareAvailable: isHardware,
            }),
        )

        await checkSecurityDowngrade(level)
    }, [checkSecurityDowngrade, dispatch])

    useEffect(() => {
        if (
            currentAppState === AppStateType.ACTIVE &&
            previousAppState !== AppStateType.INACTIVE
        ) {
            init()
        }
    }, [currentAppState, init, previousAppState])

    return <></>
}
