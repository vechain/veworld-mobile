import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { selectSelectedNetwork } from "./Network"
import { selectSelectedAccount } from "./Account"
import AccountUtils from "~Utils/AccountUtils"

export const selectWalletPreferences = createSelector(
    [(state: RootState) => state.walletPreferences, selectSelectedNetwork, selectSelectedAccount],
    (walletPreferences, network, account) => {
        if (!network.genesis.id || !account.address || AccountUtils.isObservedAccount(account)) {
            return undefined
        }
        return walletPreferences[network.genesis.id]?.[account.address] ?? undefined
    },
)

export const selectLastValidatorExited = createSelector(selectWalletPreferences, walletPreferences => {
    return walletPreferences?.lastValidatorExitedAt ?? undefined
})
