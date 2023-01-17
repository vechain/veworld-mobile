import { address } from "thor-devkit"
import { AppDispatch, AppThunk } from "~Storage/Caches/cache"
import {
    initialAccountState,
    updateAccounts,
} from "~Storage/Caches/AccountCache"
import AccountStore from "~Storage/Stores/AccountStore"
import { AccountStorageData, WalletAccount } from "~Model/Account"
import BalanceService from "../BalanceService"
import { ThunkActionDispatch } from "redux-thunk/src/types"
import AddressUtils from "~Common/Utils/AddressUtils"
import { Device } from "~Model/Device"
import {
    compareAddresses,
    getAddressFromXPub,
} from "~Common/Utils/AddressUtils/AddressUtils"
import Format from "~Common/Utils/FormattingUtils"
import { DEVICE_TYPE } from "~Model/Wallet/enums"
import { veWorldErrors } from "~Common/Errors"
import { VET, VTHO } from "~Common/constants/Token/TokenConstants"
import { debug, error } from "~Common/Logger/Logger"

const nextAccountId = (accounts: WalletAccount[]): number =>
    Math.max(...accounts.map(acc => acc.id), 0) + 1

const nextAlias = (accountId: number) => `Account ${accountId}`

/**
 * Update the account store and cache
 * The store must be unlocked
 * @param accountsUpdate - the update to apply to the accounts
 */
const update =
    (
        accountsUpdate: (storage: AccountStorageData) => void,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Updating account")
        try {
            //Ensure we always have an account selected
            const ensureSelectedAndUpdated = (storage: AccountStorageData) => {
                if (storage.accounts.length > 0) {
                    const currentAccountExist = storage.accounts.find(acc =>
                        compareAddresses(
                            acc.address,
                            storage.currentAccount?.address,
                        ),
                    )
                    if (!currentAccountExist || !storage.currentAccount)
                        storage.currentAccount = storage.accounts[0]
                    else storage.currentAccount = currentAccountExist
                }
            }

            // Update & Get the result
            const updatedAccount = await AccountStore.update([
                accountsUpdate,
                ensureSelectedAndUpdated,
            ])

            //Update the cache
            dispatch(updateAccounts(updatedAccount))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to update accounts",
            })
        }
    }

/**
 * Reset the account store and cache
 * The store must be unlocked
 */
const reset = (): AppThunk<Promise<void>> => async dispatch => {
    try {
        debug("Removing all accounts")

        await AccountStore.insert(initialAccountState)
        dispatch(updateAccounts(initialAccountState))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to remove accounts",
        })
    }
}

const initialiseCache = (): AppThunk<Promise<void>> => async dispatch => {
    try {
        debug("Initialising accounts cache")

        const storedAccountData = await AccountStore.get()
        dispatch(updateAccounts(storedAccountData))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to initialise accounts cache",
        })
    }
}

/**
 * Add the provided account
 * The store must be unlocked
 * @param device - The device to generate the next account from
 */
const addNext =
    (device: Device): AppThunk<Promise<void>> =>
    async dispatch => {
        try {
            debug("Adding an account")

            const accountsUpdate = async (storage: AccountStorageData) => {
                const nextId = nextAccountId(storage.accounts)
                const account = await getNext(storage.accounts, device, nextId)

                // Make sure the address is correctly formatted
                account.address = address.toChecksumed(account.address)

                // Check if the account already exists. Leave state unchanged if it does.
                const existing = storage.accounts.filter(acc =>
                    AddressUtils.compareAddresses(
                        acc.address,
                        account?.address,
                    ),
                )

                if (existing.length > 0) {
                    // No update required
                    return
                }

                storage.accounts.push(account)
            }

            await dispatch(update(accountsUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to add account",
            })
        }
    }

/**
 * When a new device is added, check for existing VET and VTHO balances and add accounts
 * that have a balance. If there are no balances or an error is thrown, just add the first account
 * The store must be unlocked
 * @param device - The device object
 * @param selectedAccounts - The optional account indexes to add
 */
const addForNewDevice =
    (device: Device, selectedAccounts?: number[]): AppThunk<Promise<void>> =>
    async dispatch => {
        try {
            debug(`Adding accounts on for new device ${device.alias}`)

            const accountsUpdate = async (storage: AccountStorageData) => {
                const accountId = nextAccountId(storage.accounts)

                if (device.type === DEVICE_TYPE.LOCAL_PRIVATE_KEY) {
                    storage.accounts.push({
                        alias: nextAlias(accountId),
                        address: device.rootAddress,
                        rootAddress: device.rootAddress,
                        index: 0,
                        visible: true,
                        id: accountId,
                    })
                } else {
                    //If manually selected accounts
                    if (selectedAccounts) {
                        for (const [
                            walletIndex,
                            index,
                        ] of selectedAccounts.entries()) {
                            const account = getAccountForIndex(
                                walletIndex,
                                device,
                                accountId + index,
                            )
                            storage.accounts.push(account)
                        }
                    } else {
                        const hdAccounts = await dispatch(
                            getForHdDevice(device, accountId),
                        )
                        storage.accounts.push(...hdAccounts)
                    }
                }
            }

            // Persist the accounts
            await dispatch(update(accountsUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to add accounts for new device",
            })
        }
    }

const getAccountForIndex = (
    walletIndex: number,
    device: Device,
    accountId: number,
): WalletAccount => {
    debug(`Getting account for device, index ${walletIndex}`)
    if (!device.xPub)
        throw veWorldErrors.rpc.invalidRequest({
            message: "The XPub can't be null for HD devices",
        })

    const accountAddress = getAddressFromXPub(device.xPub, walletIndex)

    return {
        alias: nextAlias(accountId),
        address: accountAddress,
        rootAddress: device.rootAddress,
        index: walletIndex,
        visible: true,
        id: accountId,
    }
}

const getForHdDevice =
    (device: Device, accountId: number): AppThunk<Promise<WalletAccount[]>> =>
    async dispatch => {
        debug("Getting accounts for hardware device")

        const hdAccounts = []

        // Add the first one always
        hdAccounts.push(getAccountForIndex(0, device, accountId))
        // Then try to add more accounts.
        try {
            for (let index = 1; index < 50; index++) {
                const balanceExists = await dispatch(hasBalance(index, device))
                if (balanceExists) {
                    hdAccounts.push(
                        getAccountForIndex(index, device, accountId + index),
                    )
                } else break
            }
        } catch (e) {
            error(
                "An error occurred when looking for accounts with a balance.",
                e,
            )
        }

        return hdAccounts
    }

const hasBalance =
    (accountIndex: number, device: Device): AppThunk<Promise<boolean>> =>
    async dispatch => {
        debug("Checking if account has balance")

        if (!device.xPub)
            throw veWorldErrors.rpc.invalidRequest({
                message: "The XPub can't be null for HD devices",
            })

        const accountAddress = getAddressFromXPub(device.xPub, accountIndex)

        const { balance, energy } = await dispatch(
            BalanceService.getVetAndVthoBalancesFromBlockchain(accountAddress),
        )
        const scaledBalance = Number(
            Format.scaleNumberDown(balance, VET.decimals),
        )
        const scaledEnergy = Number(
            Format.scaleNumberDown(energy, VTHO.decimals),
        )

        return scaledBalance > 0 || scaledEnergy > 0
    }

/**
 * Set the provided account as the selected account
 * @param accountAddress - the account to select
 */
const select =
    (accountAddress: string): AppThunk<Promise<void>> =>
    async (dispatch: ThunkActionDispatch<AppDispatch>) => {
        debug("Switching account")

        try {
            const accountsUpdate = (storage: AccountStorageData) => {
                // Check that the account exists
                const account = storage.accounts.find(acc =>
                    AddressUtils.compareAddresses(acc.address, accountAddress),
                )
                if (!account)
                    throw veWorldErrors.rpc.invalidInput({
                        message: `Account ${accountAddress} not found`,
                    })

                if (!account.visible)
                    throw veWorldErrors.rpc.invalidInput({
                        message: `Account ${accountAddress} not visible`,
                    })

                // Select the account
                storage.currentAccount = account
            }

            await dispatch(update(accountsUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to select account",
            })
        }
    }

/**
 * Get the next account
 * @param accountAlias - the name to give this account
 * @param accounts - the existing accounts
 * @param device - The device used to derive the next account
 * @returns the next account
 */
const getNext = async (
    accounts: WalletAccount[],
    device: Device,
    accountId: number,
): Promise<WalletAccount> => {
    try {
        debug("Getting next account for device")

        const relevantAccounts = accounts.filter(acc =>
            AddressUtils.compareAddresses(acc.rootAddress, device.rootAddress),
        )

        const nextIndex =
            relevantAccounts.length > 0
                ? Math.max(...relevantAccounts.map(acc => acc.index)) + 1
                : 0

        if (device.type === DEVICE_TYPE.LOCAL_PRIVATE_KEY)
            throw veWorldErrors.rpc.invalidRequest({
                message: "Can't add accounts for non-HD wallets",
            })

        if (!device.xPub)
            throw veWorldErrors.rpc.invalidRequest({
                message: "The XPub can't be null for HD devices",
            })

        const addr = AddressUtils.getAddressFromXPub(device.xPub, nextIndex)

        return {
            alias: nextAlias(accountId),
            address: addr,
            rootAddress: device.rootAddress,
            index: nextIndex,
            visible: true,
            id: accountId,
        }
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to get next account",
        })
    }
}

/**
 * Remove the given account. This should be used with caution. We generally want to hide the
 * address rather than remove it.
 * @param accountAddress - The address of the account to remove
 */
const remove =
    (accountAddress: string): AppThunk<Promise<void>> =>
    async dispatch => {
        try {
            debug("Removing account")

            const accountsUpdate = (storage: AccountStorageData) => {
                if (storage.accounts.length < 2)
                    throw Error(
                        "Cannot delete the last account. You must wipe the wallet in this scenario",
                    )

                // Get the index of the account in the state
                const indexOfExisting = storage.accounts.findIndex(acc =>
                    AddressUtils.compareAddresses(acc.address, accountAddress),
                )

                if (indexOfExisting < 0) {
                    // No update required
                    return
                }

                // Remove and store the accounts
                storage.accounts.splice(indexOfExisting, 1)
            }

            await dispatch(update(accountsUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to remove account",
            })
        }
    }

/**
 * Rename the given account
 * @param accountAddress - The address of the account to rename
 * @param alias - The new alias for the account
 */
const rename =
    (accountAddress: string, alias: string): AppThunk<Promise<void>> =>
    async dispatch => {
        try {
            debug("Renaming account")

            const accountsUpdate = (storage: AccountStorageData) => {
                // Get the index of the account in the state
                const indexOfExisting = storage.accounts.findIndex(acc =>
                    AddressUtils.compareAddresses(acc.address, accountAddress),
                )

                if (indexOfExisting < 0)
                    throw veWorldErrors.rpc.resourceNotFound({
                        message: `Failed to find account ${accountAddress}`,
                    })

                // Rename and store
                storage.accounts[indexOfExisting].alias = alias.trim()
            }

            await dispatch(update(accountsUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to rename account",
            })
        }
    }

/**
 * Remove all addresses for a given device
 * @param rootAddress - The rootAddress of the device
 */
const removeAllForDevice =
    (rootAddress: string): AppThunk<Promise<void>> =>
    async dispatch => {
        try {
            debug("Removing accounts for a device")

            const accountsUpdate = (storage: AccountStorageData) => {
                storage.accounts = storage.accounts.filter(acc => {
                    return !AddressUtils.compareAddresses(
                        acc.rootAddress,
                        rootAddress,
                    )
                })
            }

            await dispatch(update(accountsUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to remove accounts for device",
            })
        }
    }

export enum ToggleVisibleMode {
    TOGGLE = "TOGGLE",
    VISIBLE = "VISIBLE",
    INVISIBLE = "INVISIBLE",
}

/**
 * Toggle the visible flag the given account
 * No action on the current account would take effect
 * @param accountAddresses - List of account (addresses) we want to change the visibility
 * @param mode - How to update the visibility of the provided accounts
 */
const toggleVisible =
    (
        accountAddresses: string[],
        mode: ToggleVisibleMode,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Toggling account visibility")

        try {
            const accountsUpdate = (storage: AccountStorageData) => {
                // Update visible flag for each provided account according to mode
                storage.accounts.forEach(acc => {
                    const isCurrentAccount = compareAddresses(
                        acc.address,
                        storage.currentAccount?.address,
                    )

                    if (
                        !isCurrentAccount &&
                        accountAddresses.some(addr =>
                            AddressUtils.compareAddresses(acc.address, addr),
                        )
                    ) {
                        switch (mode) {
                            case ToggleVisibleMode.TOGGLE:
                                acc.visible = !acc.visible
                                break
                            case ToggleVisibleMode.VISIBLE:
                                acc.visible = true
                                break
                            case ToggleVisibleMode.INVISIBLE:
                                acc.visible = false
                                break
                        }
                    }
                })
            }

            await dispatch(update(accountsUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to remove account",
            })
        }
    }

const lock = () => AccountStore.lock()

const unlock = (key: string) => AccountStore.unlock(key)

const checkEncryptionKey = async (encryptionKey: string): Promise<boolean> =>
    AccountStore.checkEncryptionKey(encryptionKey)

export default {
    getNext,
    update,
    rename,
    reset,
    initialiseCache,
    addForNewDevice,
    select,
    remove,
    removeAllForDevice,
    toggleVisible,
    lock,
    unlock,
    addNext,
    checkEncryptionKey,
}
