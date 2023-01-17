import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { WALLET_STATUS } from "~Model/Wallet/enums"
import { RootState } from "~Storage/Caches/cache"
import { WalletAccess } from "~Model/Wallet"
import { debug } from "~Common/Logger/Logger"

export const initialWalletAccessState: WalletAccess = {
    status: WALLET_STATUS.NOT_INITIALISED,
}

export const walletAccessSlice = createSlice({
    name: "walletAccess",
    initialState: initialWalletAccessState,
    reducers: {
        updateWalletStatus: (
            state: Draft<WalletAccess>,
            action: PayloadAction<WALLET_STATUS>,
        ) => {
            state.status = action.payload
        },

        clearEntireCache: () => {
            // This will be handled in the rootReducer
            debug("Clearing cache")
        },
    },
})

export const { updateWalletStatus, clearEntireCache } =
    walletAccessSlice.actions

export const getStatus = (state: RootState) => state.walletAccess.status
