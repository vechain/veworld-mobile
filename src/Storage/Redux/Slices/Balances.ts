import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { NETWORK_TYPE } from "~Model/Network/enums"
import { AddressUtils, HexUtils } from "~Utils"

export type BalanceState = {
    [network in NETWORK_TYPE]: {
        [accountAddress: string]: {
            hiddenTokenAddresses: string[]
        }
    }
}

export const initialState: BalanceState = {
    [NETWORK_TYPE.MAIN]: {},
    [NETWORK_TYPE.TEST]: {},
    [NETWORK_TYPE.SOLO]: {},
    [NETWORK_TYPE.OTHER]: {},
}

const ensureBalanceSlotExists = (state: Draft<BalanceState>, network: NETWORK_TYPE, accountAddress: string) => {
    if (!state[network]) state[network] = {}

    if (!state[network][accountAddress])
        state[network][accountAddress] = {
            hiddenTokenAddresses: [],
        }
}

export const BalanceSlice = createSlice({
    name: "balances",
    initialState: initialState,
    reducers: {
        toggleTokenVisibility: (
            state,
            action: PayloadAction<{ network: NETWORK_TYPE; accountAddress: string; tokenAddress: string }>,
        ) => {
            const { network, accountAddress: _accountAddress, tokenAddress: _tokenAddress } = action.payload
            const accountAddress = HexUtils.normalize(_accountAddress)
            const tokenAddress = HexUtils.normalize(_tokenAddress)

            ensureBalanceSlotExists(state, network, accountAddress)

            const foundIndex = state[network][accountAddress].hiddenTokenAddresses.findIndex(u =>
                AddressUtils.compareAddresses(u, tokenAddress),
            )
            if (foundIndex > -1) state[network][accountAddress].hiddenTokenAddresses.splice(foundIndex, 1)
            else state[network][accountAddress].hiddenTokenAddresses.push(tokenAddress)
        },
        removeBalancesByAddress: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                network: NETWORK_TYPE
                accountAddress: string | string[]
            }>,
        ) => {
            const { network, accountAddress } = action.payload
            if (Array.isArray(accountAddress)) {
                accountAddress.forEach(address => {
                    const normAccountAddress = HexUtils.normalize(address)
                    ensureBalanceSlotExists(state, network, normAccountAddress)
                    delete state[network][normAccountAddress]
                })
            } else {
                const normAccountAddress = HexUtils.normalize(accountAddress)
                ensureBalanceSlotExists(state, network, normAccountAddress)

                delete state[network][normAccountAddress]
            }
        },

        resetBalancesState: () => initialState,
    },
})

export const { toggleTokenVisibility, removeBalancesByAddress, resetBalancesState } = BalanceSlice.actions
