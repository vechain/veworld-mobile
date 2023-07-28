import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AddressUtils } from "~Utils"
import { BaseDevice, LedgerDevice, LocalDevice } from "~Model"

type Device = LedgerDevice | LocalDevice
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
            action: PayloadAction<{
                rootAddress: string
                device: Device
            }>,
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
        removeDevice: (state, action: PayloadAction<BaseDevice>) => {
            const { rootAddress } = action.payload

            const deviceExistsIndex = state.findIndex(device =>
                AddressUtils.compareAddresses(device.rootAddress, rootAddress),
            )
            if (deviceExistsIndex === -1) return

            state.splice(deviceExistsIndex, 1)
        },
        resetDeviceState: () => initialDeviceState,
    },
})

export const {
    renameDevice,
    addDevice,
    updateDevice,
    bulkUpdateDevices,
    removeDevice,
    resetDeviceState,
} = DeviceSlice.actions
