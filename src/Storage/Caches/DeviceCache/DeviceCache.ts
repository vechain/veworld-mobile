import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "~Storage/Caches/cache"
import { Device } from "~Model/Device"
import AddressUtils from "~Common/Utils/AddressUtils"
import { DEVICE_TYPE } from "~Model/Wallet/enums"

export const initialDeviceState: Device[] = []

export const deviceSlice = createSlice({
    name: "devices",
    initialState: initialDeviceState,
    reducers: {
        updateDevice: (_, action: PayloadAction<Device[]>) => {
            return action.payload
        },
    },
})

export const { updateDevice } = deviceSlice.actions

export const getAllDevices = (state: RootState) => state.devices

export const getAllDevicesForType =
    (walletType: DEVICE_TYPE) =>
    (state: RootState): Device[] => {
        return state.devices.filter(device => device.type === walletType)
    }

export const getDevice =
    (rootAddress?: string) =>
    (state: RootState): Device | undefined => {
        return state.devices.find(dev =>
            AddressUtils.compareAddresses(dev.rootAddress, rootAddress),
        )
    }
