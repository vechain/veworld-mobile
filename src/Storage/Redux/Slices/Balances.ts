import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { AddressUtils, debug, HexUtils } from "~Utils"
import { Balance, NETWORK_TYPE } from "~Model"
import { mergeArrays } from "~Utils/MergeUtils/MergeUtils"

export type BalanceState = {
    [network in NETWORK_TYPE]: {
        [accountAddress: string]: Balance[]
    }
}

const normaliseAddresses = (balances: Balance[]) => {
    balances.forEach(balance => {
        balance.tokenAddress = HexUtils.normalize(balance.tokenAddress)
    })
}

export const initialState: BalanceState = {
    [NETWORK_TYPE.MAIN]: {},
    [NETWORK_TYPE.TEST]: {},
    [NETWORK_TYPE.SOLO]: {},
    [NETWORK_TYPE.OTHER]: {},
}

const ensureBalanceSlotExists = (
    state: Draft<BalanceState>,
    network: NETWORK_TYPE,
    accountAddress: string,
) => {
    if (!state[network]) state[network] = {}

    if (!state[network][accountAddress]) state[network][accountAddress] = []
}

export const BalanceSlice = createSlice({
    name: "balances",
    initialState: initialState,
    reducers: {
        addTokenBalance: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                network: NETWORK_TYPE
                accountAddress: string
                balance: Balance
            }>,
        ) => {
            const { network, accountAddress, balance } = action.payload

            const normAccountAddress = HexUtils.normalize(accountAddress)
            normaliseAddresses([balance])

            ensureBalanceSlotExists(state, network, normAccountAddress)

            if (
                state[network][normAccountAddress]
                    .map(row => row.tokenAddress)
                    .includes(balance.tokenAddress)
            ) {
                state[network][normAccountAddress] = state[network][
                    normAccountAddress
                ].map(_balance => {
                    if (
                        AddressUtils.compareAddresses(
                            balance.tokenAddress,
                            _balance.tokenAddress,
                        )
                    ) {
                        debug("balance already present showing it", _balance)
                        return {
                            ..._balance,
                            isHidden: false,
                        }
                    }
                    return _balance
                })
                return
            } else {
                debug("creating balance ", balance)
                state[network][normAccountAddress].push({
                    ...balance,
                    position: state[network][normAccountAddress].length,
                })
            }
        },
        updateTokenBalances: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                network: NETWORK_TYPE
                accountAddress: string
                newBalances: Balance[]
            }>,
        ) => {
            const { network, accountAddress, newBalances } = action.payload

            normaliseAddresses(newBalances)
            const normAccountAddress = HexUtils.normalize(accountAddress)

            ensureBalanceSlotExists(state, network, normAccountAddress)

            const existingBalances = state[network][normAccountAddress]

            // Merge existing balances with new balances
            const mergedBalances = mergeArrays(
                existingBalances,
                newBalances,
                "tokenAddress",
                ["isHidden"],
            )

            // Add new balances
            state[network][normAccountAddress] = mergedBalances
        },
        removeTokenBalance: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                network: NETWORK_TYPE
                accountAddress: string
                tokenAddress: string
            }>,
        ) => {
            const { network, accountAddress, tokenAddress } = action.payload

            const normAccountAddress = HexUtils.normalize(accountAddress)
            const normTokenAddress = HexUtils.normalize(tokenAddress)

            ensureBalanceSlotExists(state, network, accountAddress)

            state[network][normAccountAddress] = state[network][
                normAccountAddress
            ].map(balance => {
                if (
                    AddressUtils.compareAddresses(
                        balance.tokenAddress,
                        normTokenAddress,
                    )
                ) {
                    debug(`Removing balance ${balance.tokenAddress}`)
                    return {
                        ...balance,
                        isHidden: true,
                    }
                }
                return balance
            })
        },

        changeBalancePosition: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                network: NETWORK_TYPE
                accountAddress: string
                updatedAccountBalances: Balance[]
            }>,
        ) => {
            const { network, accountAddress, updatedAccountBalances } =
                action.payload

            const normAccountAddress = HexUtils.normalize(accountAddress)
            ensureBalanceSlotExists(state, network, normAccountAddress)

            state[network][normAccountAddress] = state[network][
                normAccountAddress
            ].map(balance => {
                const updatedBalance = updatedAccountBalances.find(
                    updatedAccountBalance =>
                        AddressUtils.compareAddresses(
                            balance.tokenAddress,
                            updatedAccountBalance.tokenAddress,
                        ),
                )
                return updatedBalance ? updatedBalance : balance
            })
        },

        resetBalancesState: () => initialState,
    },
})

export const {
    addTokenBalance,
    updateTokenBalances,
    removeTokenBalance,
    changeBalancePosition,
    resetBalancesState,
} = BalanceSlice.actions
