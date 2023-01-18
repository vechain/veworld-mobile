import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
    AccountStorageData,
    DEVICE_TYPE,
    Device,
    GroupedAccounts,
    WalletAccount,
} from "~Model"
import { RootState } from "../cache"
import { AddressUtils } from "~Common"

export const initialAccountState: AccountStorageData = {
    accounts: [],
    currentAccount: undefined,
}

export const accountSlice = createSlice({
    name: "account",
    initialState: initialAccountState,
    reducers: {
        updateAccounts: (_, action: PayloadAction<AccountStorageData>) => {
            return action.payload
        },
    },
})

export const { updateAccounts } = accountSlice.actions

export const getAllAccounts = (state: RootState) => state.account.accounts

export const getVisibleAccounts = (state: RootState) =>
    state.account.accounts.filter(acc => acc.visible)

export const getAccount = (address?: string) => (state: RootState) => {
    if (!address) return getCurrentAccount(state)

    return state.account.accounts.find(
        acc =>
            acc.visible && AddressUtils.compareAddresses(acc.address, address),
    )
}

/**
 * Gets a list of accounts managed by a given Device
 * @param device
 */
export const getDeviceAccounts = (device: Device) => (state: RootState) => {
    return state.account.accounts.filter(acc =>
        AddressUtils.compareAddresses(acc.rootAddress, device.rootAddress),
    )
}

/**
 * Gets a list of accounts managed by a given Device
 * @param device
 */
export const getDeviceForAccount =
    (account?: WalletAccount) => (state: RootState) => {
        return state.devices.find(device =>
            AddressUtils.compareAddresses(
                account?.rootAddress,
                device.rootAddress,
            ),
        )
    }

/**
 * Return a list of the devices with an associated mnemonic
 */
export const getMnemonicDevices = (state: RootState): Device[] => {
    return state.devices.filter(dev => dev.type === DEVICE_TYPE.LOCAL_MNEMONIC)
}

/**
 * Gets a list of accounts grouped by their wallet/device
 */
export const getGroupedAccounts = (state: RootState): GroupedAccounts[] => {
    return state.devices.map(device => {
        return {
            device: device,
            accounts: state.account.accounts.filter(acc =>
                AddressUtils.compareAddresses(
                    acc.rootAddress,
                    device.rootAddress,
                ),
            ),
        }
    })
}

export const getCurrentAccount = (
    state: RootState,
): WalletAccount | undefined => state.account.currentAccount
