import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { selectSelectedNetwork } from "./Network"
import { selectSelectedAccountAddress } from "./Account"

export const selectWalletPreferences = createSelector(
    [(state: RootState) => state.walletPreferences, selectSelectedNetwork, selectSelectedAccountAddress],
    (walletPreferences, network, accountAddress) => {
        if (!network.genesis.id || !accountAddress) {
            return undefined
        }
        return walletPreferences[network.genesis.id]?.[accountAddress] ?? undefined
    },
)

export const selectLastValidatorExited = createSelector(selectWalletPreferences, walletPreferences => {
    return walletPreferences?.lastValidatorExitedAt ?? undefined
})

export const selectLastValidatorExitedId = createSelector(selectWalletPreferences, walletPreferences => {
    return walletPreferences?.lastValidatorExitedId ?? undefined
})
