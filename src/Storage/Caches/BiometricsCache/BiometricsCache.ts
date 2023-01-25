import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { BiometricState, SecurityLevelType } from "~Model"

export const initialBiometricsState: BiometricState = {
    currentSecurityLevel: "NONE",
    authtypeAvailable: "FACIAL_RECOGNITION",
    isDeviceEnrolled: false,
    isHardwareAvailable: false,
    accessControl: false,
    isSecurityDowngrade: false,
}

export const biometricsSlice = createSlice({
    name: "biometricsState",
    initialState: initialBiometricsState,
    reducers: {
        setBiometrics: (state, action: PayloadAction<BiometricState>) => {
            const { payload } = action

            let isBiometrics =
                !payload.isDeviceEnrolled ||
                !payload.isHardwareAvailable ||
                payload.currentSecurityLevel !== SecurityLevelType.BIOMETRIC
                    ? false
                    : true

            state.authtypeAvailable = payload.authtypeAvailable
            state.currentSecurityLevel = payload.currentSecurityLevel
            state.isDeviceEnrolled = payload.isDeviceEnrolled
            state.isHardwareAvailable = payload.isHardwareAvailable
            state.accessControl = isBiometrics
        },

        setSecurtyDowngrade: (state, action: PayloadAction<boolean>) => {
            const { payload } = action
            state.isSecurityDowngrade = payload
        },
    },
})

export const { setBiometrics, setSecurtyDowngrade } = biometricsSlice.actions
