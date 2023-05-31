import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AddressUtils } from "~Utils"
import { WalletAccount } from "~Model"

/**
 * The state of the account slice
 * @param accounts the list of accounts
 * @param selectedAccount the address of the selected account
 */

type AccountSliceState = {
    accounts: WalletAccount[]
    selectedAccount?: string
}
export const initialAccountState: AccountSliceState = {
    accounts: [],
    selectedAccount: undefined,
}

export const AccountSlice = createSlice({
    name: "accounts",
    initialState: initialAccountState,
    reducers: {
        selectAccount: (state, action: PayloadAction<{ address: string }>) => {
            const { address } = action.payload
            const accountExists = state.accounts.find(account =>
                AddressUtils.compareAddresses(account.address, address),
            )
            if (accountExists) {
                state.selectedAccount = address
            }
        },
        addAccount: (
            state,
            action: PayloadAction<WalletAccount | WalletAccount[]>,
        ) => {
            const newAccounts: WalletAccount[] = []
            if (!Array.isArray(action.payload)) newAccounts.push(action.payload)
            else newAccounts.push(...action.payload)

            const accountsToInsert: WalletAccount[] = []
            newAccounts.forEach(newAcc => {
                const accountExists = state.accounts.find(account =>
                    AddressUtils.compareAddresses(
                        account.address,
                        newAcc.address,
                    ),
                )
                if (!accountExists) accountsToInsert.push(newAcc)
            })
            state.accounts.push(...accountsToInsert)
            state.selectedAccount = accountsToInsert[0].address
        },
        removeAccountsByDevice: (
            state,
            action: PayloadAction<{ rootAddress: string }>,
        ) => {
            const { rootAddress } = action.payload
            const updatedAccounts = state.accounts.filter(
                account =>
                    !AddressUtils.compareAddresses(
                        rootAddress,
                        account.rootAddress,
                    ),
            )
            const selectedExists = updatedAccounts.find(account =>
                AddressUtils.compareAddresses(
                    state.selectedAccount,
                    account.address,
                ),
            )
            if (!selectedExists) {
                throw new Error("Cannot delete the selected account!")
            }
            state.accounts = updatedAccounts
        },
        renameAccount: (
            state,
            action: PayloadAction<{ address: string; alias: string }>,
        ) => {
            const { address, alias } = action.payload
            const accountExistsIndex = state.accounts.findIndex(account =>
                AddressUtils.compareAddresses(account.address, address),
            )
            if (accountExistsIndex !== -1) {
                state.accounts[accountExistsIndex].alias = alias
            }
        },
        setAccountVisibility: (
            state,
            action: PayloadAction<{ address: string; visibile: boolean }>,
        ) => {
            const { address, visibile } = action.payload
            const accountExistsIndex = state.accounts.findIndex(account =>
                AddressUtils.compareAddresses(account.address, address),
            )
            if (accountExistsIndex !== -1) {
                state.accounts[accountExistsIndex].visible = visibile
            }
        },
        toggleAccountVisibility: (
            state,
            action: PayloadAction<{ address: string }>,
        ) => {
            const { address } = action.payload
            const accountExistsIndex = state.accounts.findIndex(account =>
                AddressUtils.compareAddresses(account.address, address),
            )
            if (accountExistsIndex !== -1) {
                state.accounts[accountExistsIndex].visible =
                    !state.accounts[accountExistsIndex].visible
            }
        },
    },
})

export const {
    selectAccount,
    addAccount,
    renameAccount,
    removeAccountsByDevice,
    setAccountVisibility,
    toggleAccountVisibility,
} = AccountSlice.actions
