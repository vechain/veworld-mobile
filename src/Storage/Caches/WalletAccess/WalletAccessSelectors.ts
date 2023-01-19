// import { createSelector } from "@reduxjs/toolkit"
// import { WALLET_STATUS } from "../../model/Wallet/enums"
// import { RootState } from "../cache"

// export const getStatus = (state: RootState) => state.walletAccess.status

// export const getIsUnlocked = createSelector(
//     getStatus,
//     status => status === WALLET_STATUS.UNLOCKED,
// )

// export const getIsFirstTimeAccess = createSelector(
//     getStatus,
//     status => status === WALLET_STATUS.FIRST_TIME_ACCESS,
// )

// export const getIsLocked = createSelector(
//     getStatus,
//     status => status === WALLET_STATUS.LOCKED,
// )

// export const getNotInitialised = createSelector(
//     getStatus,
//     status => status === WALLET_STATUS.NOT_INITIALISED,
// )
