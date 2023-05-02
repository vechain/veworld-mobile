import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
import { RootState } from "../Types"
import { AccountSlice } from "../Slices"

const selectAccountsState = (state: RootState) => state[AccountSlice.name]

/**
 * @returns the selected account
 */
export const selectSelectedAccount = createSelector(
    selectAccountsState,
    state => {
        return state.accounts.find(account =>
            AddressUtils.compareAddresses(
                state.selectedAccount,
                account.address,
            ),
        )
    },
)

/**
 * @returns all the accounts
 */
export const selectAccounts = createSelector(selectAccountsState, state => {
    return state.accounts
})

/**
 * @returns all the visibile accounts
 */
export const selectVisibleAccounts = createSelector(
    selectAccountsState,
    state => {
        return state.accounts.filter(account => account.visible)
    },
)

/**
 *
 * @param rootAddress rootAddress of device to get accounts for
 * @returns  all accounts for the given device
 */
export const selectAccountsByDevice = (rootAddress?: string) =>
    createSelector(selectAccountsState, state => {
        return state.accounts.filter(account =>
            AddressUtils.compareAddresses(rootAddress, account.rootAddress),
        )
    })
