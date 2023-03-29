import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.accounts

/**
 * @returns the selected account
 */
export const getSelectedAccount = createSelector(reducer, state => {
    return state.accounts.find(account =>
        AddressUtils.compareAddresses(state.selectedAccount, account.address),
    )
})

/**
 * @returns all the accounts
 */
export const getAccounts = createSelector(reducer, state => {
    return state.accounts
})

/**
 * @returns all the visibile accounts
 */
export const getVisibleAccounts = createSelector(reducer, state => {
    return state.accounts.filter(account => account.visible)
})

/**
 *
 * @param rootAddress rootAddress of device to get accounts for
 * @returns  all accounts for the given device
 */
export const getAccountsByDevice = (rootAddress?: string) =>
    createSelector(reducer, state => {
        return state.accounts.filter(account =>
            AddressUtils.compareAddresses(rootAddress, account.rootAddress),
        )
    })
