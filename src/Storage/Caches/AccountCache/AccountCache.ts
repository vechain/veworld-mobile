// import { createSlice, PayloadAction } from "@reduxjs/toolkit"
// import {
//     AccountStorageData,
//     DEVICE_TYPE,
//     Device,
//     GroupedAccounts,
//     WalletAccount,
// } from "~Model"
// import { RootState } from "../cache"
// import { AddressUtils } from "~Common"

// export const initialAccountState: AccountStorageData = {
//     accounts: [],
//     currentAccount: undefined,
// }

// export const accountSlice = createSlice({
//     name: "account",
//     initialState: initialAccountState,
//     reducers: {
//         updateAccounts: (_, action: PayloadAction<AccountStorageData>) => {
//             return action.payload
//         },
//     },
// })

// export const { updateAccounts } = accountSlice.actions
