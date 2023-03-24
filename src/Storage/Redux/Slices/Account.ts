import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
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

export const { renameAccount, setAccountVisibility, toggleAccountVisibility } =
    AccountSlice.actions
