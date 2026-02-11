import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { BaseDevice, LedgerDevice, LocalDevice, SmartWalletDevice, DEVICE_TYPE } from "~Model"
import { AddressUtils } from "~Utils"
import { SocialProvider } from "~VechainWalletKit/types/wallet"

type Device = LedgerDevice | LocalDevice | SmartWalletDevice
export const initialDeviceState: Device[] = []

export const DeviceSlice = createSlice({
    name: "devices",
    initialState: initialDeviceState,
    reducers: {
        renameDevice: (state, action: PayloadAction<{ rootAddress: string; alias: string }>) => {
            const { rootAddress, alias } = action.payload
            const deviceExistsIndex = state.findIndex(device =>
                AddressUtils.compareAddresses(device.rootAddress, rootAddress),
            )
            if (deviceExistsIndex !== -1) {
                state[deviceExistsIndex].alias = alias
            }
        },
        addDevice: (state, action: PayloadAction<Device>) => {
            state.push({
                ...action.payload,
                position: state.length,
            })
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
            if (deviceExistsIndex === -1) throw new Error(`Device with root address ${rootAddress} does not exist`)

            state[deviceExistsIndex] = newDeviceData
        },
        bulkUpdateDevices: (state, action: PayloadAction<Device[]>) => {
            const devicesToUpdate = action.payload

            devicesToUpdate.forEach(device => {
                const deviceExistsIndex = state.findIndex(existingDevice =>
                    AddressUtils.compareAddresses(existingDevice.rootAddress, device.rootAddress),
                )
                if (deviceExistsIndex === -1)
                    throw new Error(`Device with root address ${device.rootAddress} does not exist`)

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

            state.forEach(
                (device, index) =>
                    (state[index] = {
                        ...device,
                        position: index,
                    }),
            )
        },
        setDeviceIsBackup: (
            state,
            action: PayloadAction<{ rootAddress: string; isBackup: boolean; isBackupManual: boolean; date: string }>,
        ) => {
            const { rootAddress, isBackup, isBackupManual, date } = action.payload
            const deviceExistsIndex = state.findIndex(device =>
                AddressUtils.compareAddresses(device.rootAddress, rootAddress),
            )
            if (deviceExistsIndex === -1) throw new Error(`Device with root address ${rootAddress} does not exist`)

            state[deviceExistsIndex].isBuckedUp = isBackup
            state[deviceExistsIndex].lastBackupDate = date
            state[deviceExistsIndex].isBackedUpManual = isBackupManual
        },
        updateDeviceLinkedProviders: (
            state,
            action: PayloadAction<{ rootAddress: string; linkedProviders: SocialProvider[] }>,
        ) => {
            const { rootAddress, linkedProviders } = action.payload
            const deviceIndex = state.findIndex(device =>
                AddressUtils.compareAddresses(device.rootAddress, rootAddress),
            )
            if (deviceIndex !== -1 && state[deviceIndex].type === DEVICE_TYPE.SMART_WALLET) {
                ;(state[deviceIndex] as SmartWalletDevice).linkedProviders = linkedProviders
            }
        },
        resetDeviceState: () => initialDeviceState,
        setDeviceState: (
            state: Device[],
            action: PayloadAction<{
                updatedDevices: Device[]
            }>,
        ) => action.payload.updatedDevices,
    },
})

export const {
    renameDevice,
    addDevice,
    updateDevice,
    bulkUpdateDevices,
    removeDevice,
    resetDeviceState,
    setDeviceState,
    setDeviceIsBackup,
    updateDeviceLinkedProviders,
} = DeviceSlice.actions
