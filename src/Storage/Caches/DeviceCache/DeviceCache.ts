import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Device, DeviceState } from "~Model"

export const initialDeviceState: DeviceState = {
    devices: [],
}

export const deviceSlice = createSlice({
    name: "devices",
    initialState: initialDeviceState,
    reducers: {
        setDevices: (state, action: PayloadAction<Device[]>) => {
            state.devices = action.payload
        },
    },
})

export const { setDevices } = deviceSlice.actions
