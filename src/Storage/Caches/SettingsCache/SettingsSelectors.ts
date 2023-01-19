// import { RootState } from "../cache"
// import { WINDOW_THEME_KEY } from "../../../common/constants/Settings/SettingsConstants"
// import { ContactType } from "../../model/Contact/enum"
// import { genesises } from "../../../common/constants/Thor/ThorConstants"
// import { createSelector } from "@reduxjs/toolkit"
// import { getAllAccounts } from "../AccountCache"
// import { getIsUnlocked } from "../WalletAccess"

// export const getSettings = (state: RootState) => state.settings

// // Network Settings

// export const getNetworkSettings = createSelector(
//     getSettings,
//     settings => settings.network,
// )

// export const getCurrentNetwork = createSelector(
//     getNetworkSettings,
//     networkSettings => networkSettings.currentNetwork,
// )

// export const getShowConversion = createSelector(
//     getNetworkSettings,
//     networkSettings => networkSettings.showConversionOtherNets,
// )

// export const showFiatRates = createSelector(
//     getCurrentNetwork,
//     getShowConversion,
//     (network, showConversion) =>
//         network.genesis.id === genesises.main.id || showConversion,
// )

// export const getAllNetworks = createSelector(
//     getNetworkSettings,
//     networkSettings => networkSettings.networks,
// )

// export const getDefaultNetworks = createSelector(getAllNetworks, allNetworks =>
//     allNetworks.filter(net => net.defaultNet),
// )

// export const getCustomNetworks = createSelector(getAllNetworks, allNetworks =>
//     allNetworks.filter(net => !net.defaultNet),
// )

// export const getNetworkById = createSelector(
//     [getAllNetworks, (_, id?: string) => id],
//     (allNetworks, id?: string) => allNetworks.find(net => net.id === id),
// )

// // Security and Privacy Settings

// export const getSecuritySettings = createSelector(
//     getSettings,
//     settings => settings.securityAndPrivacy,
// )

// export const getWalletMode = createSelector(
//     getSecuritySettings,
//     securitySettings => securitySettings.localWalletMode,
// )

// // General Settings

// export const getGeneralSettings = createSelector(
//     getSettings,
//     settings => settings.general,
// )

// export const getHidingZeroBalances = createSelector(
//     getGeneralSettings,
//     generalSettings => generalSettings.hideNoBalanceTokens,
// )

// export const getColorTheme = createSelector(
//     getIsUnlocked,
//     getGeneralSettings,
//     (isUnlocked, generalSettings) => {
//         const theme = window.localStorage.getItem(WINDOW_THEME_KEY)

//         if (theme && isUnlocked) return theme

//         return generalSettings.theme
//     },
// )

// // Advanced Settings

// export const getAdvancedSettings = createSelector(
//     getSettings,
//     settings => settings.advanced,
// )

// // Contacts

// export const getContacts = createSelector(
//     getSettings,
//     settings => settings.contact,
// )

// export const getKnownContacts = createSelector(getContacts, contacts =>
//     contacts.addressBook.filter(contact => contact.type === ContactType.KNOWN),
// )

// export const getCachedContacts = createSelector(getContacts, contacts =>
//     contacts.addressBook.filter(contact => contact.type === ContactType.CACHE),
// )

// export const getLookupContacts = createSelector(
//     getKnownContacts,
//     getAllAccounts,
//     (knownContacts, allAccounts) =>
//         allAccounts
//             .map(account => {
//                 return {
//                     alias: account.alias,
//                     address: account.address,
//                 }
//             })
//             .concat(knownContacts),
// )

// export const getContactById = createSelector(
//     [getContacts, (_, id?: string) => id],
//     (contacts, id) => contacts.addressBook.find(contact => contact.id === id),
// )

// export const getDownloadStateLog = (state: RootState) => {
//     return {
//         accounts: state.account.accounts,
//         activities: state.activities,
//         settings: state.settings,
//         connectedApps: state.connectedApps,
//         tokens: state.tokens,
//     }
// }
