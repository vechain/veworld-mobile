// import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
// import { debug } from "~Common"
// import { WALLET_STATUS, WalletAccess } from "~Model"
// import { RootState } from "../cache"

// export const initialWalletAccessState: WalletAccess = {
//     status: WALLET_STATUS.NOT_INITIALISED,
// }

// export const walletAccessSlice = createSlice({
//     name: "walletAccess",
//     initialState: initialWalletAccessState,
//     reducers: {
//         updateWalletStatus: (
//             state: Draft<WalletAccess>,
//             action: PayloadAction<WALLET_STATUS>,
//         ) => {
//             state.status = action.payload
//         },

//         clearEntireCache: () => {
//             // This will be handled in the rootReducer
//             debug("Clearing cache")
//         },
//     },
// })

// export const { updateWalletStatus, clearEntireCache } =
//     walletAccessSlice.actions

// export const getStatus = (state: RootState) => state.walletAccess.status
