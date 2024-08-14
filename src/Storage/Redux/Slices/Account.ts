import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AccountUtils, AddressUtils, HexUtils } from "~Utils"
import { AccountWithDevice, WalletAccount } from "~Model"
import { isEmpty } from "lodash"

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
        setSelectedAccount: (state, action: PayloadAction<{ address: string }>) => {
            const { address } = action.payload
            const accountExists = state.accounts.find(account =>
                AddressUtils.compareAddresses(account.address, address),
            )
            if (accountExists) {
                state.selectedAccount = address
            }
        },
        //Should remove the account from the list of accounts, and change to the first account on the device if the selected account is the one being removed
        removeAccount: (state, action: PayloadAction<AccountWithDevice>) => {
            const { address, rootAddress } = action.payload

            if (state.accounts.length <= 1) {
                throw new Error("Cannot delete the last account!")
            }

            const deviceAccounts = state.accounts.filter(account =>
                AddressUtils.compareAddresses(account.rootAddress, rootAddress),
            )

            if (deviceAccounts.length <= 1) {
                throw new Error("Cannot delete the last account on the device!")
            }

            //Change the selected account if the selected account is the one being removed
            if (state.selectedAccount && AddressUtils.compareAddresses(state.selectedAccount, address)) {
                const otherAccounts = state.accounts.filter(
                    account => !AddressUtils.compareAddresses(account.address, address),
                )
                state.selectedAccount = otherAccounts[0].address
            }

            const accountExistsIndex = state.accounts.findIndex(account =>
                AddressUtils.compareAddresses(account.address, address),
            )

            //Remove the account
            if (accountExistsIndex !== -1) {
                state.accounts.splice(accountExistsIndex, 1)
            }
        },
        addAccount: (state, action: PayloadAction<WalletAccount | WalletAccount[]>) => {
            const newAccounts: WalletAccount[] = []
            if (!Array.isArray(action.payload)) newAccounts.push(action.payload)
            else newAccounts.push(...action.payload)

            const newNormalizedAccounts = newAccounts.map(account => ({
                ...account,
                address: HexUtils.normalize(account.address),
                rootAddress: HexUtils.normalize(account.rootAddress),
            }))

            const accountsToInsert: WalletAccount[] = []
            newNormalizedAccounts.forEach(newAcc => {
                const accountExists = state.accounts.find(account =>
                    AddressUtils.compareAddresses(account.address, newAcc.address),
                )

                if (!accountExists) accountsToInsert.push(newAcc)
            })

            if (isEmpty(accountsToInsert)) return
            state.accounts.push(...accountsToInsert)
            state.selectedAccount = accountsToInsert[0].address
        },
        removeAccountsByDevice: (state, action: PayloadAction<{ rootAddress: string }>) => {
            const { rootAddress } = action.payload
            const updatedAccounts = state.accounts.filter(
                account => !AddressUtils.compareAddresses(rootAddress, account.rootAddress),
            )
            const selectedExists = updatedAccounts.find(account =>
                AddressUtils.compareAddresses(state.selectedAccount, account.address),
            )
            if (!selectedExists) {
                throw new Error("Cannot delete the selected account!")
            }
            state.accounts = updatedAccounts
        },
        renameAccount: (state, action: PayloadAction<{ address: string; alias: string }>) => {
            const { address, alias } = action.payload
            const accountExistsIndex = state.accounts.findIndex(account =>
                AddressUtils.compareAddresses(account.address, address),
            )
            if (accountExistsIndex !== -1) {
                state.accounts[accountExistsIndex].alias = alias
            }

            state.accounts[accountExistsIndex].alias = alias
        },
        setAccountVisibility: (state, action: PayloadAction<{ address: string; visibile: boolean }>) => {
            const { address, visibile } = action.payload
            const accountExistsIndex = state.accounts.findIndex(account =>
                AddressUtils.compareAddresses(account.address, address),
            )
            if (accountExistsIndex !== -1) {
                state.accounts[accountExistsIndex].visible = visibile
            }
        },
        toggleAccountVisibility: (state, action: PayloadAction<{ address: string }>) => {
            const { address } = action.payload
            const accountExistsIndex = state.accounts.findIndex(account =>
                AddressUtils.compareAddresses(account.address, address),
            )
            if (accountExistsIndex !== -1) {
                state.accounts[accountExistsIndex].visible = !state.accounts[accountExistsIndex].visible
            }
        },
        setVnsNames: (state, action: PayloadAction<{ name: string; address: string }[]>) => {
            state.accounts.forEach(account => {
                account.vnsName = (AccountUtils.updateAccoutVns(account, action.payload) as WalletAccount).vnsName
            })
        },
        resetAccountState: () => initialAccountState,
    },
})

export const {
    removeAccount,
    setSelectedAccount,
    addAccount,
    renameAccount,
    removeAccountsByDevice,
    setAccountVisibility,
    toggleAccountVisibility,
    resetAccountState,
    setVnsNames,
} = AccountSlice.actions
