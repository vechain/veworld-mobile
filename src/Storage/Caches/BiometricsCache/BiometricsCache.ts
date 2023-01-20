import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { BiometricState } from "~Model"

export const initialBiometricsState: BiometricState = {
    currentSecurityLevel: "NONE",
    authtypeAvailable: "FACIAL_RECOGNITION",
    isDeviceEnrolled: false,
    isHardwareAvailable: false,
}

export const biometricsSlice = createSlice({
    name: "biometricsState",
    initialState: initialBiometricsState,
    reducers: {
        setBiometrics: (_, action: PayloadAction<BiometricState>) => {
            return action.payload
        },
    },
})

export const { setBiometrics } = biometricsSlice.actions
