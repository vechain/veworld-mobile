import { createSelector } from "@reduxjs/toolkit"
import { SecurityLevelType } from "~Model"
import { RootState } from "~Storage/Caches"

const biometricsSlice = (state: RootState) => state.biometricsState

export const selectSecurityLevel = createSelector(
    biometricsSlice,
    state => state.currentSecurityLevel,
)

export const selectAvailableAuthType = createSelector(
    biometricsSlice,
    state => state.authtypeAvailable,
)

export const selectIsBiometrics = createSelector(biometricsSlice, state => {
    if (
        !state.isDeviceEnrolled ||
        !state.isHardwareAvailable ||
        state.currentSecurityLevel === SecurityLevelType.NONE
    ) {
        return false
    }

    return true
})
