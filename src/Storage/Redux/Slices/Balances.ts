import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { AddressUtils, DEFAULT_VECHAIN_TOKENS_MAP, VET, VTHO } from "~Common"
import { Account, Network } from "~Model"
import { BalanceState, TokenBalance } from "../Types/Balances"

export const initialState: BalanceState = []

export const BalanceSlice = createSlice({
    name: "balances",
    initialState: initialState,
    reducers: {
        addTokenBalance: (
            state: Draft<BalanceState>,
            action: PayloadAction<TokenBalance>,
        ) => {
            state.push(action.payload)
        },
        removeTokenBalance: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                accountAddress: string
                tokenAddress: string
            }>,
        ) => {
            const { accountAddress, tokenAddress } = action.payload

            let position = 0
            return state
                .filter(
                    // remove deleted element
                    balance =>
                        balance.tokenAddress !== tokenAddress ||
                        balance.accountAddress !== accountAddress,
                )
                .map(balance => {
                    //recalculate positions
                    if (
                        balance.tokenAddress === tokenAddress &&
                        balance.accountAddress === accountAddress &&
                        !AddressUtils.compareAddresses(
                            balance.tokenAddress,
                            VET.address,
                        ) &&
                        !AddressUtils.compareAddresses(
                            balance.tokenAddress,
                            VTHO.address,
                        )
                    ) {
                        const newBalance = {
                            ...balance,
                            position,
                        }
                        position++
                        return newBalance
                    }
                    return balance
                })
        },
        changeBalancePosition: (
            state: Draft<BalanceState>,
            action: PayloadAction<TokenBalance[]>, // tokenBalances with updated position fields
        ) => {
            const updatedAccountBalances = action.payload
            return state.map(balance => {
                const updatedBalance = updatedAccountBalances.find(
                    updatedAccountBalance =>
                        balance.tokenAddress ===
                            updatedAccountBalance.tokenAddress &&
                        balance.accountAddress ===
                            updatedAccountBalance.accountAddress,
                )
                return updatedBalance ? updatedBalance : balance
            })
        },
        setTokenBalances: (
            state: Draft<BalanceState>,
            action: PayloadAction<TokenBalance[]>,
        ) => {
            return action.payload
        },
        resetTokenBalances: (
            state: Draft<BalanceState>,
            action: PayloadAction<{ network: Network; account: Account }>,
        ) => {
            const { network, account } = action.payload
            const defaultTokens = DEFAULT_VECHAIN_TOKENS_MAP.get(network.type)
            return defaultTokens!!.map(token => ({
                accountAddress: account?.address,
                tokenAddress: token.address,
                balance: "0",
                timeUpdated: new Date().toISOString(),
                networkGenesisId: network.genesis.id,
            }))
        },
    },
})

export const {
    addTokenBalance,
    setTokenBalances,
    removeTokenBalance,
    changeBalancePosition,
    resetTokenBalances,
} = BalanceSlice.actions
