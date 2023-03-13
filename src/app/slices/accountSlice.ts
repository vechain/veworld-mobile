import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "~app/rootReducer"
import { AddressUtils } from "~Common"
import { getAliasName } from "~Common/Hooks/useCreateAccount/Helpers/getAliasName"
import { compareAddresses } from "~Common/Utils/AddressUtils/AddressUtils"
import { AccountStorageData, Device } from "~Model"

export const initialAccountState: AccountStorageData = {
    accounts: [],
    currentAccount: undefined,
}

export const accountSlice = createSlice({
    name: "account",
    initialState: initialAccountState,
    reducers: {
        addNextAccount: (state, action: PayloadAction<Device>) => {
            const device = action.payload
            if (!device.xPub) throw new Error("Device does not have an xPub")

            const deviceAccounts = state.accounts.filter(account =>
                compareAddresses(device.rootAddress, account.rootAddress),
            )
            const nextIndex = deviceAccounts.length
            const newAddress = AddressUtils.getAddressFromXPub(
                device.xPub,
                nextIndex,
            )
            state.accounts.push({
                address: newAddress,
                index: nextIndex,
                visible: true,
                rootAddress: device.rootAddress,
                alias: getAliasName(),
            })
        },
        toggleAccountVisibility: (state, action: PayloadAction<string>) => {
            const account = state.accounts.find(acc =>
                compareAddresses(acc.address, action.payload),
            )
            if (account) {
                account.visible = !account.visible
            }
        },

        updateAccounts: (_, action: PayloadAction<AccountStorageData>) => {
            return action.payload
        },
    },
})

export const { updateAccounts } = accountSlice.actions

export const getCurrentAccount = (state: RootState) =>
    state.account.currentAccount

export const getAccounts = (state: RootState) => state.account.accounts

export const getVisibleAccounts = (state: RootState) =>
    state.account.accounts.filter(account => account.visible)

export const getAccountByAddress = (address?: string) => (state: RootState) =>
    state.account.accounts.find(account =>
        compareAddresses(address, account.address),
    )
export const getAccountsByDevice = (device?: Device) => (state: RootState) =>
    state.account.accounts.filter(account =>
        compareAddresses(device?.rootAddress, account.rootAddress),
    )

export default accountSlice.reducer
