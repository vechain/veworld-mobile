import React, { useCallback, useEffect } from "react"
import { BiometricsUtils } from "~Common"
import { AppStateType } from "~Model"
import {
    selectCurrentAppState,
    selectPreviousAppState,
    setBiometrics,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Caches"

export const Security = () => {
    const dispatch = useAppDispatch()
    const currentAppState = useAppSelector(selectCurrentAppState)
    const previousAppState = useAppSelector(selectPreviousAppState)

    const init = useCallback(async () => {
        let level = await BiometricsUtils.getDeviceEnrolledLevel()
        let isHardware = await BiometricsUtils.getGeviceHasHardware()
        let isEnrolled = await BiometricsUtils.getIsDeviceEnrolled()
        let typeAvalable = await BiometricsUtils.getBiometricTypeAvailable()

        dispatch(
            setBiometrics({
                currentSecurityLevel: level,
                authtypeAvailable: typeAvalable,
                isDeviceEnrolled: isEnrolled,
                isHardwareAvailable: isHardware,
            }),
        )
    }, [dispatch])

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
