import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
import { Device } from "~Model"

export const initialDeviceState: Device[] = []

export const DeviceSlice = createSlice({
    name: "devices",
    initialState: initialDeviceState,
    reducers: {
        renameDevice: (
            state,
            action: PayloadAction<{ rootAddress: string; alias: string }>,
        ) => {
            const { rootAddress, alias } = action.payload
            const deviceExistsIndex = state.findIndex(device =>
                AddressUtils.compareAddresses(device.rootAddress, rootAddress),
            )
            if (deviceExistsIndex !== -1) {
                state[deviceExistsIndex].alias = alias
            }
        },
    },
})

export const { renameDevice } = DeviceSlice.actions
