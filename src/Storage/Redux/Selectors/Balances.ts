import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "~Storage/Redux/Types"
import { selectSelectedNetwork } from "./Network"
import { HexUtils } from "~Utils"

export const selectBalancesState = (state: RootState) => state.balances

export const selectHiddenBalancesByAccount = createSelector(
    selectBalancesState,
    selectSelectedNetwork,
    (_state: RootState, accountAddress: string) => accountAddress,
    (balances, network, accountAddress) => {
        return balances[network.type]?.[HexUtils.normalize(accountAddress)]?.hiddenTokenAddresses ?? []
    },
)
