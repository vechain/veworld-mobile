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
        addDevice: (state, action: PayloadAction<Device>) => {
            state.push(action.payload)
        },
        removeDeviceByIndex: (
            state,
            action: PayloadAction<{ index: number }>,
        ) => {
            const { index } = action.payload

            if (index < 0) {
                // No update required
                return
            }

            state.splice(index, 1)
        },
    },
})

export const { renameDevice, addDevice, removeDeviceByIndex } =
    DeviceSlice.actions
