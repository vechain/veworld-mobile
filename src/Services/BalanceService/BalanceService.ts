import {
    AddressUtils,
    ThorConstants,
    TokenConstants,
    debug,
    error,
    veWorldErrors,
} from "~Common"
import { Balance, BalanceStorageData } from "~Model"
import { SettingService } from "~Services"
import {
    AppThunk,
    getBalancesForAccount,
    getCurrentNetwork,
    updateBalances,
} from "~Storage/Caches"
import { BalanceStore } from "~Storage/Stores"

/**
 * Returns the balances from the store
 * @returns return the balances from the store
 */
const get = async (): Promise<BalanceStorageData> => {
    return await BalanceStore.get()
}

/**
 * Update the balances store and cache
 * @param balanceUpdate - the update to apply to the selected tokens
 */
const update =
    (
        balanceUpdate: (storage: BalanceStorageData) => void,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Updating balance")

        try {
            // Update & Get the result
            const upd = await BalanceStore.update([balanceUpdate])
            //Update the cache
            dispatch(updateBalances(upd.balances))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to update balances",
            })
        }
    }

/**
 * Reset the balances store and cache
 */
const reset = (): AppThunk<Promise<void>> => async dispatch => {
    debug("Resetting balances")

    try {
        await BalanceStore.insert({
            balances: [],
        })
        dispatch(updateBalances([]))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to reset balances",
        })
    }
}

/**
 * Initialise the cache from the store
 */
const initialiseCache = (): AppThunk<Promise<void>> => async dispatch => {
    debug("Initialising balances cache")

    try {
        const storage = await get()
        dispatch(updateBalances(storage.balances))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to initialise balances cache",
        })
    }
}

const remove =
    (balance: Balance): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Removing balance")

        try {
            const balanceUpdate = (storage: BalanceStorageData) => {
                // Get the index of the balance in the state
                const indexOfExisting = storage.balances.findIndex(
                    bal =>
                        AddressUtils.compareAddresses(
                            bal.accountAddress,
                            balance.accountAddress,
                        ) &&
                        AddressUtils.compareAddresses(
                            bal.tokenAddress,
                            balance.tokenAddress,
                        ) &&
                        AddressUtils.compareAddresses(
                            bal.genesisId,
                            balance.genesisId,
                        ),
                )

                if (indexOfExisting < 0) {
                    // No update required
                    return
                }

                // Remove and store the accounts
                storage.balances.splice(indexOfExisting, 1)
            }
            await dispatch(update(balanceUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to remove balance",
            })
        }
    }

/**
 * Adds a new balance
 * @param tokenAddresses - the token address for this balance
 * @param accountAddress - the acccount address for this balance
 */
const addOrUpdate =
    (
        tokenAddresses: string[],
        accountAddress: string,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Adding or updating a balance")

        try {
            // 1. Get the balances
            const balances: Balance[] = []
            for (const tokenAddress of tokenAddresses) {
                balances.push(
                    await dispatch(
                        getBalanceFromBlockchain(tokenAddress, accountAddress),
                    ),
                )
            }
            // 2. Create update function
            const balanceUpdate = (storage: BalanceStorageData) => {
                for (const balance of balances) {
                    // Check if a balance already exists
                    const indexOfExisting = storage.balances.findIndex(
                        bal =>
                            AddressUtils.compareAddresses(
                                bal.accountAddress,
                                balance.accountAddress,
                            ) &&
                            AddressUtils.compareAddresses(
                                bal.tokenAddress,
                                balance.tokenAddress,
                            ) &&
                            AddressUtils.compareAddresses(
                                bal.genesisId,
                                balance.genesisId,
                            ),
                    )

                    // If exists update it
                    if (indexOfExisting > -1) {
                        storage.balances[indexOfExisting].balance =
                            balance.balance
                        storage.balances[indexOfExisting].timeUpdated =
                            balance.timeUpdated
                    }
                    // Else Add balance
                    else storage.balances.push(balance)
                }
            }

            // 3. Update
            await dispatch(update(balanceUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to add balance",
            })
        }
    }

/**
 * Updates all balances for an account
 * @param accountAddress - the acccount address for this balance
 */
const updateAllForAccount =
    (accountAddress: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        debug("Adding or updating all for account")

        try {
            // 1. Get token addresses that have a balance for this account
            const adds = getBalancesForAccount(accountAddress)(getState()).map(
                b => b.tokenAddress,
            )

            // 2. Ensure VET and VTHO are included
            if (
                !adds.some(a =>
                    AddressUtils.compareAddresses(
                        a,
                        TokenConstants.VET.address,
                    ),
                )
            )
                adds.push(TokenConstants.VET.address)

            if (
                !adds.some(a =>
                    AddressUtils.compareAddresses(
                        a,
                        TokenConstants.VTHO.address,
                    ),
                )
            )
                adds.push(TokenConstants.VTHO.address)

            // 3. Update balances
            await dispatch(addOrUpdate(adds, accountAddress))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to update balances",
            })
        }
    }

/**
 * Calls out to external sources to get the balance
 * @param tokenAddress
 * @param accountAddress
 * @returns balance
 */
const getBalanceFromBlockchain =
    (
        tokenAddress: string,
        accountAddress: string,
    ): AppThunk<Promise<Balance>> =>
    async (dispatch, getState) => {
        debug("Getting balances from the chain")

        try {
            const network = getCurrentNetwork(getState())

            // We get the balance differently depending on whether it's a VIP180 or VET/VTHO
            let balance: string
            if (
                AddressUtils.compareAddresses(
                    tokenAddress,
                    TokenConstants.VET.address,
                )
            )
                balance = (
                    await dispatch(
                        getVetAndVthoBalancesFromBlockchain(accountAddress),
                    )
                ).balance
            else if (
                AddressUtils.compareAddresses(
                    tokenAddress,
                    TokenConstants.VTHO.address,
                )
            )
                balance = (
                    await dispatch(
                        getVetAndVthoBalancesFromBlockchain(accountAddress),
                    )
                ).energy
            else
                balance = await dispatch(
                    getTokenBalanceFromBlockchain(accountAddress, tokenAddress),
                )

            return {
                balance,
                accountAddress,
                genesisId: network.genesis.id,
                tokenAddress,
                timeUpdated: Date.now(),
            }
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to get balance from external service",
            })
        }
    }

/**
 * Use axios instead of connex because connex waits indefinitely
 * @param address
 */
const getVetAndVthoBalancesFromBlockchain =
    (address: string): AppThunk<Promise<Connex.Thor.Account>> =>
    async (_, getState) => {
        debug("Getting VET and VTHO balances from the chain")

        const network = getCurrentNetwork(getState())

        // TODO: install axios?
        const accountResponse = await axios.get<Connex.Thor.Account>(
            `${network.url}/accounts/${address}`,
        )

        return accountResponse.data
    }

const getTokenBalanceFromBlockchain =
    (accountAddress: string, tokenAddress: string): AppThunk<Promise<string>> =>
    async (_, getState) => {
        debug("Getting token balance from the chain")

        const network = getCurrentNetwork(getState())

        const thorClient = await SettingService.Network.getConnexThor(network)

        try {
            const res = await thorClient
                .account(tokenAddress)
                .method(ThorConstants.abis.vip180.balanceOf)
                .call(accountAddress)

            return res.decoded[0]
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message:
                    "Failed to get data from contract. Wrong network/ Contract address? ",
            })
        }
    }

const lock = () => BalanceStore.lock()

const unlock = (key: string) => BalanceStore.unlock(key)

export default {
    get,
    getBalanceFromBlockchain,
    getVetAndVthoBalancesFromBlockchain,
    getTokenBalanceFromBlockchain,
    update,
    updateAllForAccount,
    reset,
    initialiseCache,
    addOrUpdate,
    remove,
    lock,
    unlock,
}
