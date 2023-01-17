import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "~Storage/Caches/cache"
import { Balance } from "~Model/Balance"
import AddressUtils from "~Common/Utils/AddressUtils"
import { getCurrentNetwork } from "../SettingsCache"
import { getCurrentAccount } from "../AccountCache"

export const initialBalanceState: Balance[] = []

export const balanceSlice = createSlice({
    name: "balances",
    initialState: initialBalanceState,
    reducers: {
        updateBalances: (_, action: PayloadAction<Balance[]>) => {
            return action.payload
        },
    },
})

export const { updateBalances } = balanceSlice.actions

export const getAllBalances = (state: RootState): Balance[] => {
    const network = getCurrentNetwork(state)
    return state.balances.filter(b => b.genesisId === network.genesis.id)
}

export const getBalanceForAccount =
    (tokenAddress: string, accountAddress: string) =>
    (state: RootState): Balance | undefined => {
        const network = getCurrentNetwork(state)
        return state.balances.find(
            b =>
                AddressUtils.compareAddresses(
                    b.genesisId,
                    network.genesis.id,
                ) &&
                AddressUtils.compareAddresses(b.tokenAddress, tokenAddress) &&
                AddressUtils.compareAddresses(b.accountAddress, accountAddress),
        )
    }

export const getBalanceForSelectedAccount =
    (tokenAddress?: string) =>
    (state: RootState): Balance | undefined => {
        if (!tokenAddress) return undefined
        const currentAccount = getCurrentAccount(state)
        if (!currentAccount) return undefined
        return getBalanceForAccount(tokenAddress, currentAccount.address)(state)
    }

export const getBalancesForAccount =
    (accountAddress: string) =>
    (state: RootState): Balance[] => {
        const network = getCurrentNetwork(state)
        return state.balances.filter(
            b =>
                AddressUtils.compareAddresses(
                    b.genesisId,
                    network.genesis.id,
                ) &&
                AddressUtils.compareAddresses(b.accountAddress, accountAddress),
        )
    }

export const getBalancesForSelectedAccount = (state: RootState): Balance[] => {
    const currentAccount = getCurrentAccount(state)
    if (!currentAccount) return []
    return getBalancesForAccount(currentAccount.address)(state)
}
