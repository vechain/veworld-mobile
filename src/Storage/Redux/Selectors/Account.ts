import { createSelector } from "@reduxjs/toolkit"
import sortBy from "lodash/sortBy"
import { AccountWithDevice, DEVICE_TYPE, LocalAccountWithDevice } from "~Model"
import { AccountUtils, AddressUtils } from "~Utils"
import { RootState } from "../Types"
import { selectDevicesState } from "./Device"

export const selectAccountsState = (state: RootState) => state.accounts

/**
 * @returns all the accounts
 */
export const selectAccounts = createSelector(selectAccountsState, selectDevicesState, (state, devices) => {
    return sortBy(
        state.accounts.map(account => {
            const device = devices.find(_device =>
                AddressUtils.compareAddresses(_device.rootAddress, account.rootAddress),
            )
            // console.log("device", device, account)
            if (AccountUtils.isObservedAccount(account)) {
                return account
            } else {
                if (!device) {
                    throw new Error(`No device found for account ${account.address}`)
                }
                return {
                    ...account,
                    device,
                }
            }
        }) as AccountWithDevice[],
        // Sort by device position else if account is observe only place last
        account => account?.device?.position ?? state.accounts.length,
    )
})

/**
 * @returns all the accounts
 */
export const selectSelectedAccountAddress = createSelector(selectAccountsState, state => {
    return state.selectedAccount
})

/**
 * @returns the selected account if there is one
 */
export const selectSelectedAccountOrNull = createSelector(
    selectAccounts,
    selectSelectedAccountAddress,
    (accounts, selectedAccountAddress) => {
        const selectedAccount = accounts.find(account =>
            AddressUtils.compareAddresses(selectedAccountAddress, account.address),
        )

        if (!selectedAccount && accounts.length > 0) {
            return accounts[0]
        }

        return selectedAccount
    },
)

/**
 * @returns the selected account
 * @throws if there is no selected account
 */
export const selectSelectedAccount = createSelector(selectSelectedAccountOrNull, selectedAccount => {
    if (!selectedAccount) {
        throw new Error("Failed to find selected account")
    }
    return selectedAccount
})

export const selectOtherAccounts = createSelector(
    selectAccounts,
    selectSelectedAccount,
    (allAccounts, currentAccount) => {
        return allAccounts.filter(_account => !AddressUtils.compareAddresses(_account.address, currentAccount.address))
    },
)

export const selectAccountsWithoutObserved = createSelector(selectAccounts, allAccounts =>
    allAccounts.filter(_account => !AccountUtils.isObservedAccount(_account)),
)

/**
 * @returns all the visibile accounts
 */
export const selectVisibleAccounts = createSelector(selectAccounts, accounts => {
    return accounts.filter(account => account.visible)
})

/**
 * @returns all the visibile accounts
 */
export const selectVisibleAccountsWithoutObserved = createSelector(selectAccounts, accounts => {
    return accounts.filter(account => account.visible && !AccountUtils.isObservedAccount(account))
})

/**
 * @returns all the visibile accounts that are not ledger
 */
export const selectVisibleAccountsWithoutObservedAndLedger = createSelector(
    selectVisibleAccountsWithoutObserved,
    accounts => {
        return accounts.filter(account => account.visible && account.device.type !== DEVICE_TYPE.LEDGER)
    },
)

/**
 * @returns all the visibile accounts but the selected one
 */
export const selectVisibleAccountsButSelected = createSelector(
    [selectVisibleAccounts, selectSelectedAccountAddress],
    (accounts, selectedAccountAddress) => {
        return accounts.filter(account => !AddressUtils.compareAddresses(selectedAccountAddress, account.address))
    },
)

export const selectDelegationAccounts = createSelector(
    [selectAccounts, selectSelectedAccountAddress],
    (accounts, selectedAccountAddress) => {
        let accountsWithoutObservedAccounts = accounts.filter(account => !AccountUtils.isObservedAccount(account))

        return accountsWithoutObservedAccounts.filter(
            account =>
                (account.device.type === DEVICE_TYPE.LOCAL_MNEMONIC ||
                    account.device.type === DEVICE_TYPE.LOCAL_PRIVATE_KEY) &&
                !AddressUtils.compareAddresses(selectedAccountAddress, account.address),
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
        return accounts.filter(account => AddressUtils.compareAddresses(rootAddress, account.rootAddress))
    },
)

export const selectAccountByAddress = createSelector(
    [selectAccounts, (state: RootState, address: string) => address],
    (accounts, address) => {
        return accounts.find(account => account.address === address)
    },
)

export const selectVnsNameOrAddress = createSelector(
    [
        selectAccounts,
        (state: RootState, address: string) => address,
        (state: RootState, address: string, truncate: number[]) => truncate,
    ],
    (accounts, address, truncate) => {
        const acc = accounts.find(account => AddressUtils.compareAddresses(address, account.address))
        if (!acc) return AddressUtils.humanAddress(address, ...truncate)

        if (acc.vnsName) {
            return acc.vnsName
        } else {
            return AddressUtils.humanAddress(acc?.address, ...truncate)
        }
    },
)
