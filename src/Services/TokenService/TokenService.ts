import { veWorldErrors } from "~Common/Errors"
import { updateFungibleTokens } from "~Storage/Caches/TokenCache"
import { AppThunk } from "~Storage/Caches/cache"
import { FungibleToken, TokenStorageArea } from "~Model/Token"
import TokenStore from "~Storage/Stores/TokenStore"
import { defaultTokens } from "~Common/constants/Token/TokenConstants"
import { getBalancesForSelectedAccount } from "~Storage/Caches/BalanceCache"
import AddressUtils from "~Common/Utils/AddressUtils"
import BalanceService from "../BalanceService"
import { getCurrentAccount } from "~Storage/Caches/AccountCache"
import { NETWORK_TYPE } from "~Model/Network/enums"
import axios from "axios"
import { getCurrentNetwork } from "~Storage/Caches/SettingsCache"
import SettingService from "../SettingService"
import { abis } from "~Common/constants/Thor/ThorConstants"
import { address } from "thor-devkit"
import { debug, error } from "~Common/Logger/Logger"

const TOKEN_URL = process.env.REACT_APP_TOKEN_REGISTRY_URL
/**
 * Returns the available tokens from the store
 * @returns returns the available tokens from the store
 */
const get = async (): Promise<TokenStorageArea> => {
    return await TokenStore.get()
}

/**
 * Update the availble fungible token store and cache
 * @param availableTokenUpdate - the update to apply to available tokens
 */
const update =
    (
        availableTokenUpdate: (storage: TokenStorageArea) => void,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Updating a token")

        try {
            // Update and get the result
            const upd = await TokenStore.update([availableTokenUpdate])
            // Update the cache
            dispatch(updateFungibleTokens(upd.fungible))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to update available tokens",
            })
        }
    }

/**
 * Reset the available fungible tokens store and cache
 */
const reset = (): AppThunk<Promise<void>> => async dispatch => {
    debug("Resetting tokens")

    try {
        await TokenStore.insert({
            fungible: defaultTokens,
        })
        dispatch(updateFungibleTokens(defaultTokens))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to reset available fungible tokens",
        })
    }
}

const addCustomToken =
    (tokenAddress: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        debug("Adding custom token")

        try {
            const addr = address.toChecksumed(tokenAddress)

            const network = getCurrentNetwork(getState())
            const thor = await SettingService.Network.getConnexThor(network)

            const contract = thor.account(addr)

            const tokenName = await contract.method(abis.vip180.name).call()
            const tokenSymbol = await contract.method(abis.vip180.symbol).call()
            const decimals = await contract.method(abis.vip180.decimals).call()

            const customToken: FungibleToken = {
                genesisId: network.genesis.id,
                address: addr,
                decimals: decimals.decoded[0],
                name: tokenName.decoded[0],
                symbol: tokenSymbol.decoded[0],
                custom: true,
                icon: "",
            }

            const tokenUpdate = (storage: TokenStorageArea) => {
                if (
                    storage.fungible.find(
                        t =>
                            AddressUtils.compareAddresses(t.address, addr) &&
                            t.genesisId === network.genesis.id,
                    )
                )
                    throw veWorldErrors.rpc.invalidRequest({
                        message: "Token already exists",
                    })

                storage.fungible.push(customToken)
            }

            await dispatch(update(tokenUpdate))
            await dispatch(toggleSelectFungibleToken(addr))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to add custom token",
            })
        }
    }

/**
 * Initialise the cache from the store
 */
const initialiseCache = (): AppThunk<Promise<void>> => async dispatch => {
    debug("Initialising token cache")

    try {
        // Load the tokens from storage
        const storage = await get()
        dispatch(updateFungibleTokens(storage.fungible))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to initialise tokens from the cache",
        })
    }
}

/**
 * Toggles a token for the selected account.
 * Toggling on involves adding a balance for the selected account.
 * Toggline off involves removing a balance for the selected acccount.
 * @param tokenAddress
 * @returns
 */
const toggleSelectFungibleToken =
    (tokenAddress: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        debug("Toggling fungible token")

        try {
            // 1. Check if a balance exists for this token for the selected account
            const balance = getBalancesForSelectedAccount(getState()).find(b =>
                AddressUtils.compareAddresses(b.tokenAddress, tokenAddress),
            )

            // 2. If a balance exists remove it. If no balance exists add it.
            if (balance) await dispatch(BalanceService.remove(balance))
            else {
                const currentAccount = getCurrentAccount(getState())
                if (!currentAccount) throw Error("No account selected")
                await dispatch(
                    BalanceService.addOrUpdate(
                        [tokenAddress],
                        currentAccount.address,
                    ),
                )
            }
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to toggle token selection",
            })
        }
    }

/**
 * Update our tokens by calling out to our Github repository.
 * This call to github will return a JSON object with details
 * about known tokens for the current network.
 */
const updateTokensFromGithub =
    (): AppThunk<Promise<void>> => async dispatch => {
        debug("Updating tokens from github")

        try {
            // Get the tokens form github
            const tokensFromGithub = await dispatch(getTokensFromGithub())

            // Create an update for the tokens
            const tokenUpdate = (storage: TokenStorageArea) => {
                storage.fungible = mergeTokens(
                    tokensFromGithub,
                    storage.fungible,
                )
            }

            // // Update the tokens
            await dispatch(update(tokenUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to update tokens from github",
            })
        }
    }

/**
 * Call out to our github repo and return the tokens for the
 * current network
 * @returns
 */
const getTokensFromGithub =
    (): AppThunk<Promise<FungibleToken[]>> => async (_, getState) => {
        debug("Getting tokens from githum")

        const network = getCurrentNetwork(getState())

        let tokens: FungibleToken[] = []

        if (
            network.type === NETWORK_TYPE.MAIN ||
            network.type === NETWORK_TYPE.TEST
        ) {
            const rawTokens = await axios.get(
                `${TOKEN_URL}/${
                    network.type === NETWORK_TYPE.MAIN ? "main" : "test"
                }.json`,
                {
                    transformResponse: data => data,
                    timeout: 30 * 1000,
                },
            )

            const tokensFromGithub = JSON.parse(
                rawTokens.data,
            ) as FungibleToken[]
            tokens = tokensFromGithub.map(token => {
                return {
                    ...token,
                    genesisId: network.genesis.id,
                    icon: `${TOKEN_URL}/assets/${token.icon}`,
                    custom: false,
                }
            })
        }

        return tokens
    }

const renameCustomToken =
    (tokenAddress: string, name: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        debug("Renaming custom token")

        try {
            const network = getCurrentNetwork(getState())

            const tokenUpdate = async (storage: TokenStorageArea) => {
                const indexOfToken = storage.fungible.findIndex(
                    t =>
                        AddressUtils.compareAddresses(
                            t.address,
                            tokenAddress,
                        ) &&
                        t.genesisId === network.genesis.id &&
                        t.custom,
                )

                if (indexOfToken < 0)
                    throw veWorldErrors.rpc.invalidRequest({
                        message: "Token does not exist",
                    })

                storage.fungible[indexOfToken].name = name
            }

            await dispatch(update(tokenUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to rename custom token",
            })
        }
    }

const removeCustomToken =
    (tokenAddress: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        debug("Removing custom token")

        try {
            const network = getCurrentNetwork(getState())

            const tokenUpdate = (storage: TokenStorageArea) => {
                const indexOfExisting = storage.fungible.findIndex(
                    t =>
                        AddressUtils.compareAddresses(
                            t.address,
                            tokenAddress,
                        ) &&
                        t.genesisId === network.genesis.id &&
                        t.custom,
                )

                if (indexOfExisting >= 0) {
                    storage.fungible.splice(indexOfExisting, 1)
                }
            }

            await dispatch(update(tokenUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to remove custom token",
            })
        }
    }

const mergeTokens = (a: FungibleToken[], b: FungibleToken[]) =>
    a
        .filter(
            aa =>
                !b.find(
                    bb =>
                        aa.symbol === bb.symbol &&
                        aa.genesisId === bb.genesisId,
                ),
        )
        .concat(b)

const lock = () => TokenStore.lock()

const unlock = (key: string) => TokenStore.unlock(key)

export default {
    get,
    update,
    updateTokensFromGithub,
    reset,
    initialiseCache,
    toggleSelectFungibleToken,
    addCustomToken,
    lock,
    unlock,
    renameCustomToken,
    removeCustomToken,
}
