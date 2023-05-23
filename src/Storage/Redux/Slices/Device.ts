import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AddressUtils } from "~Utils"
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
        updateDevice: (
            state,
            action: PayloadAction<{ rootAddress: string; device: Device }>,
        ) => {
            const { rootAddress, device: newDeviceData } = action.payload
            const deviceExistsIndex = state.findIndex(device =>
                AddressUtils.compareAddresses(device.rootAddress, rootAddress),
            )
            if (deviceExistsIndex === -1)
                throw new Error(
                    `Device with root address ${rootAddress} does not exist`,
                )

            state[deviceExistsIndex] = newDeviceData
        },
        bulkUpdateDevices: (state, action: PayloadAction<Device[]>) => {
            const devicesToUpdate = action.payload

            devicesToUpdate.forEach(device => {
                const deviceExistsIndex = state.findIndex(existingDevice =>
                    AddressUtils.compareAddresses(
                        existingDevice.rootAddress,
                        device.rootAddress,
                    ),
                )
                if (deviceExistsIndex === -1)
                    throw new Error(
                        `Device with root address ${device.rootAddress} does not exist`,
                    )

                state[deviceExistsIndex] = device
            })
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

export const {
    renameDevice,
    addDevice,
    updateDevice,
    bulkUpdateDevices,
    removeDeviceByIndex,
} = DeviceSlice.actions
