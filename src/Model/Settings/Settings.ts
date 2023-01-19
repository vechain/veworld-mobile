// import { Network } from "../Network"
// import { Contact } from "../Contact"
// import { WALLET_MODE } from "../Wallet"
// import { StorageData } from "../StorageData"
// import { CURRENCY } from "./enum"

// /**
//  * All settings
//  * @param general - {@link General}
//  * @param advanced  - {@link Advanced}
//  * @param network - {@link NetworkSettings}
//  * @param contact - {@link ContactSettings}
//  * @param securityAndPrivacy  - {@link SecurityPrivacy}
//  */
// export interface Settings extends StorageData {
//     general: General
//     advanced: Advanced
//     network: NetworkSettings
//     contact: ContactSettings
//     securityAndPrivacy: SecurityPrivacy
// }

// export enum Theme {
//     LIGHT = "light",
//     DARK = "dark",
//     AUTO = "auto",
// }

// /**
//  * General Settings for the application
//  * @param currency - The base currency used to make exchange rates
//  * @param hideNoBalanceTokens - hide tokens without a balance
//  */

// export interface General {
//     currency: CURRENCY
//     hideNoBalanceTokens: boolean
//     theme: Theme
// }

// /**
//  * Advanced Settings for the application
//  * @param skipTxConfirm - skip tx confirmations
//  */
// export interface Advanced {
//     skipTxConfirm: boolean
// }

// /**
//  * Network Settings for the application
//  * @param currentNetwork - the currently selected network
//  * @param networks - a list of available networks
//  * @param showTestNetTag - a flag to indicate if on a testnet
//  * @param showConversionOtherNets - to show conversions on networks other than main
//  */
// export interface NetworkSettings {
//     currentNetwork: Network
//     networks: Network[]
//     showTestNetTag: boolean
//     showConversionOtherNets: boolean
// }

// /**
//  * Contact Settings for the application
//  * @param addressBook - a list of contacts
//  */
// export interface ContactSettings {
//     addressBook: Contact[]
// }

// /**
//  * The time in minutes to auto lock the app
//  */
// export type AutoLockTime = 15 | 30 | 60 | -1

// /**
//  * Network Settings for the application
//  * @param showIncomingTxs - show incoming transactions
//  * @param analyticsTracking - enable / disable analytics
//  * @param localWalletMode - The wallet mode
//  * @param autoLockTimer - {@link AutoLockTime}
//  */
// export interface SecurityPrivacy {
//     showIncomingTxs: boolean
//     analyticsTracking: boolean
//     localWalletMode: WALLET_MODE
//     autoLockTimer: AutoLockTime
// }
