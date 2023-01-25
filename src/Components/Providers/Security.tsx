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

            console.log("oldSecurityLevel", oldSecurityLevel)
            console.log("level", level)

            /*
                if oldSecurityLevel exists in store

                    Allways have the last level saved in store
                        compare last saved with new one
                            -> define downgrade => if old is boimetric and new is not biometric
                            -> define upgrade => if old was anything but biometric and new is biometric


                else oldSecurityLevel doesn't exist
                     its first time so write it to async store

            */

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
