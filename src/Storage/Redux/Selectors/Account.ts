import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils } from "~Utils"
import { RootState } from "../Types"
import { selectDevicesState } from "./Device"
import { AccountWithDevice } from "~Model"

export const selectAccountsState = (state: RootState) => state.accounts

/**
 * @returns all the accounts
 */
export const selectAccounts = createSelector(
    selectAccountsState,
    selectDevicesState,
    (state, devices) => {
        return state.accounts.map(account => {
            const device = devices.find(
                _device => _device.rootAddress === account.rootAddress,
            )
            if (!device) {
                throw new Error(
                    `No device found for account ${account.address}`,
                )
            }
            return {
                ...account,
                device,
            }
        }) as AccountWithDevice[]
    },
)

/**
 * @returns all the accounts
 */
export const selectSelectedAccountAddress = createSelector(
    selectAccountsState,
    state => {
        return state.selectedAccount
    },
)

/**
 * @returns the selected account
 */
export const selectSelectedAccount = createSelector(
    selectAccounts,
    selectSelectedAccountAddress,
    (accounts, selectedAccountAddress) => {
        const selectedAccount = accounts.find(account =>
            AddressUtils.compareAddresses(
                selectedAccountAddress,
                account.address,
            ),
        )
        if (!selectedAccount) {
            throw new Error(
                `No account found for address ${selectedAccountAddress}`,
            )
        }
        return selectedAccount
    },
)

/**
 * @returns all the visibile accounts
 */
export const selectVisibleAccounts = createSelector(
    selectAccounts,
    accounts => {
        return accounts.filter(account => account.visible)
    },
)

/**
 * @returns all the visibile accounts but the selected one
 */
export const selectVisibleAccountsButSelected = createSelector(
    selectVisibleAccounts,
    selectSelectedAccountAddress,
    (accounts, selectedAccountAddress) => {
        return accounts.filter(
            account =>
                !AddressUtils.compareAddresses(
                    selectedAccountAddress,
                    account.address,
                ),
        )
    },
)

/**
 *
 * @param rootAddress rootAddress of device to get accounts for
 * @returns  all accounts for the given device
 */
export const selectAccountsByDevice = createSelector(
    [selectAccounts, (state: RootState, rootAddress?: string) => rootAddress],
    (accounts, rootAddress) => {
        return accounts.filter(account =>
            AddressUtils.compareAddresses(rootAddress, account.rootAddress),
        )
    },
)
