import { SecurityPrivacy, Settings, Theme } from "~Model/Settings"
import { Network } from "~Model/Network"
import { NETWORK_TYPE } from "~Model/Network/enums"
import { WALLET_MODE } from "~Model/Wallet/enums"
import { genesises } from "../Thor/ThorConstants"
import { CURRENCY } from "~Model/Settings/enums"
import { ENV } from "~Common/Enums/Env"

const REACT_APP_ENV = (process.env.REACT_APP_ENV || ENV.PROD) as ENV

export const MAINNET: Network = {
    defaultNet: true,
    name: NETWORK_TYPE.MAIN,
    type: NETWORK_TYPE.MAIN,
    id: NETWORK_TYPE.MAIN,
    url:
        process.env.REACT_APP_THOR_MAIN_URL ||
        "https://vethor-node.vechain.com",
    genesis: genesises.main,
}

export const TESTNET: Network = {
    defaultNet: true,
    name: NETWORK_TYPE.TEST,
    type: NETWORK_TYPE.TEST,
    id: NETWORK_TYPE.TEST,
    url:
        process.env.REACT_APP_THOR_TESTNET_URL ||
        "https://vethor-node-test.vechaindev.com",
    genesis: genesises.test,
}

export const SOLO: Network = {
    defaultNet: true,
    name: NETWORK_TYPE.SOLO,
    type: NETWORK_TYPE.SOLO,
    id: NETWORK_TYPE.SOLO,
    url: process.env.REACT_APP_LOCAL_THOR_URL || "http://localhost:8669",
    genesis: genesises.solo,
}

export const getDefaultSelectedNetwork = (): Network => {
    if (REACT_APP_ENV === ENV.E2E) return SOLO
    if (process.env.NODE_ENV !== "production") return TESTNET
    return MAINNET
}

export const getDefaultNetworks = (): Network[] => {
    if (REACT_APP_ENV === ENV.E2E) return [MAINNET, TESTNET, SOLO]
    return [MAINNET, TESTNET]
}

const getCachedTheme = () => {
    // if (window) {
    //     const theme = window.localStorage.getItem(WINDOW_THEME_KEY)

    //     if (theme) return theme as Theme
    // }

    return Theme.LIGHT
}

export const getDefaultSecuritySettings = (): SecurityPrivacy => {
    return {
        showIncomingTxs: false,
        analyticsTracking: true,
        localWalletMode: WALLET_MODE.ASK_TO_SIGN,
        autoLockTimer: 15,
    }
}

export const getDefaultSettings = (): Settings => {
    return {
        general: {
            currency: CURRENCY.USD,
            hideNoBalanceTokens: false,
            theme: getCachedTheme(),
        },
        advanced: {
            skipTxConfirm: false,
        },
        network: {
            currentNetwork: getDefaultSelectedNetwork(),
            networks: getDefaultNetworks(),
            showTestNetTag: true,
            showConversionOtherNets: false,
        },
        contact: {
            addressBook: [],
        },
        securityAndPrivacy: getDefaultSecuritySettings(),
    }
}

export const WINDOW_THEME_KEY = "veworld-theme"
