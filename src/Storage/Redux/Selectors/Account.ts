import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils } from "~Utils"
import { RootState } from "../Types"
import { selectDevicesState } from "./Device"
import { AccountWithDevice, DEVICE_TYPE, LocalAccountWithDevice } from "~Model"
import sortBy from "lodash/sortBy"

export const selectAccountsState = (state: RootState) => state.accounts

/**
 * @returns all the accounts
 */
export const selectAccounts = createSelector(
    selectAccountsState,
    selectDevicesState,
    (state, devices) => {
        return sortBy(
            state.accounts.map(account => {
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
            }) as AccountWithDevice[],
            account => account.device.position,
        )
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
 * @returns the selected account if there is one
 */
export const selectSelectedAccountOrNull = createSelector(
    selectAccounts,
    selectSelectedAccountAddress,
    (accounts, selectedAccountAddress) => {
        const selectedAccount = accounts.find(account =>
            AddressUtils.compareAddresses(
                selectedAccountAddress,
                account.address,
            ),
        )

        if (!selectedAccount && accounts.length > 0) {
            return accounts[0]
        }
    },
)

/**
 * @returns the selected account
 * @throws if there is no selected account
 */
export const selectSelectedAccount = createSelector(
    selectSelectedAccountOrNull,
    selectSelectedAccountAddress,
    (selectedAccount, selectedAccountAddress) => {
        if (!selectedAccount) {
            throw new Error(
                `No account found for address ${selectedAccountAddress}`,
            )
        }
        return selectedAccount
    },
)

export const selectOtherAccounts = createSelector(
    selectAccounts,
    selectSelectedAccount,
    (allAccounts, currentAccount) => {
        return allAccounts.filter(
            _account =>
                !AddressUtils.compareAddresses(
                    _account.address,
                    currentAccount.address,
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
export const selectVisibleAccountsButSelected = createSelector(
    [selectVisibleAccounts, selectSelectedAccountAddress],
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

export const selectDelegationAccounts = createSelector(
    [selectAccounts, selectSelectedAccountAddress],
    (accounts, selectedAccountAddress) => {
        return accounts.filter(
            account =>
                account.device.type === DEVICE_TYPE.LOCAL_MNEMONIC &&
                !AddressUtils.compareAddresses(
                    selectedAccountAddress,
                    account.address,
                ),
        ) as LocalAccountWithDevice[]
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
