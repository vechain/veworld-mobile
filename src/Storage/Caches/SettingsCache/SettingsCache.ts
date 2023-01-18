import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SettingsConstants, ThorConstants } from "~Common"
import { Account, ContactType, Network, Settings } from "~Model"
import { RootState } from "../cache"

export const settingSlice = createSlice({
    name: "settings",
    initialState: SettingsConstants.getDefaultSettings(),
    reducers: {
        updateSettings: (_, action: PayloadAction<Settings>) => {
            return action.payload
        },
    },
})

export const { updateSettings } = settingSlice.actions

export const getCurrentNetwork = (state: RootState): Network =>
    state.settings.network.currentNetwork

export const getSettings = (state: RootState) => state.settings

export const showFiatRates = (state: RootState) => {
    const network = state.settings.network.currentNetwork

    return (
        network.genesis.id === ThorConstants.genesises.main.id ||
        state.settings.network.showConversionOtherNets
    )
}

export const getAllNetworks = (state: RootState) =>
    state.settings.network.networks

export const getDefaultNetworks = (state: RootState) => {
    return state.settings.network.networks.filter(net => net.defaultNet)
}

export const getCustomNetworks = (state: RootState) => {
    return state.settings.network.networks.filter(net => !net.defaultNet)
}

export const getNetworkById = (id?: string) => (state: RootState) => {
    if (id) return state.settings.network.networks.find(net => net.id === id)
}

export const getWalletMode = (state: RootState) =>
    state.settings.securityAndPrivacy.localWalletMode

export const getGeneralSettings = (state: RootState) => state.settings.general

export const getSecuritySettings = (state: RootState) =>
    state.settings.securityAndPrivacy

export const getNetworkSettings = (state: RootState) => state.settings.network

export const getAdvancedSettings = (state: RootState) => state.settings.advanced

export const getKnownContacts = (state: RootState) =>
    state.settings.contact.addressBook.filter(
        contact => contact.type === ContactType.KNOWN,
    )

export const getCachedContacts = (state: RootState) =>
    state.settings.contact.addressBook.filter(
        contact => contact.type === ContactType.CACHE,
    )

export const getLookupContacts = (state: RootState): Account[] => {
    return state.account.accounts
        .map(account => {
            return {
                alias: account.alias,
                address: account.address,
            }
        })
        .concat(getKnownContacts(state))
}

export const getContactById = (id?: string) => (state: RootState) => {
    if (id)
        return state.settings.contact.addressBook.find(
            contact => contact.id === id,
        )
}

export const getDownloadStateLog = (state: RootState) => {
    return {
        accounts: state.account.accounts,
        activities: state.activities,
        settings: state.settings,
        connectedApps: state.connectedApps,
        tokens: state.tokens,
    }
}
