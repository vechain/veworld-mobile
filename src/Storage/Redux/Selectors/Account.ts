import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils } from "~Utils"
import { RootState } from "../Types"
import { selectDevicesState } from "./Device"
import { AccountWithDevice } from "~Model"

const selectAccountsState = (state: RootState) => state.accounts

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
        return accounts.find(account =>
            AddressUtils.compareAddresses(
                selectedAccountAddress,
                account.address,
            ),
        )
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
export const selectAccountsButSelected = createSelector(
    selectAccounts,
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
export const selectAccountsByDevice = (rootAddress?: string) =>
    createSelector(selectAccounts, accounts => {
        return accounts.filter(account =>
            AddressUtils.compareAddresses(rootAddress, account.rootAddress),
        )
    })
