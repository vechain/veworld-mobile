import { PendingRequestTypes, SessionTypes, SignClientTypes } from "@walletconnect/types"
import { ethers } from "ethers"
import { IconKey } from "~Model/Icon"

export type DAppSourceType = "wallet-connect" | "in-app"

type BaseRequest = {
    type: DAppSourceType
    appUrl: string
    appName: string
    description?: string
    iconUrl?: string
}

type BaseWcRequest = BaseRequest & {
    requestEvent: PendingRequestTypes.Struct
    session: SessionTypes.Struct
    type: "wallet-connect"
}

type BaseInAppRequest = BaseRequest & {
    type: "in-app"
    id: string
    isFirstRequest: boolean
}

type BaseCertificateRequest = {
    message: Connex.Vendor.CertMessage
    options: Connex.Signer.CertOptions
    method: "thor_signCertificate"
}

type BaseTransactionRequest = {
    message: Connex.Vendor.TxMessage
    options: Connex.Signer.TxOptions
    method: "thor_sendTransaction"
}

type BaseTypedDataRequest = {
    domain: ethers.TypedDataDomain
    origin: string
    options: Connex.Signer.CertOptions
    types: Record<string, ethers.TypedDataField[]>
    value: Record<string, unknown>
    method: "thor_signTypedData"
}

type WcConnectAppRequest = BaseRequest & {
    type: "wallet-connect"
    proposal: SignClientTypes.EventArguments["session_proposal"]
}

type InAppConnectAppRequest = BaseRequest & {
    type: "in-app"
    initialRequest: InAppCertRequest | InAppTxRequest | InAppTypedDataRequest
}

type WcCertRequest = BaseCertificateRequest & BaseWcRequest

type InAppCertRequest = BaseCertificateRequest & BaseInAppRequest

type WcTxRequest = BaseTransactionRequest & BaseWcRequest

type InAppTxRequest = BaseTransactionRequest & BaseInAppRequest

type WcSignDataRequest = BaseTypedDataRequest & BaseWcRequest

type InAppTypedDataRequest = BaseTypedDataRequest & BaseInAppRequest

export type CertificateRequest = WcCertRequest | InAppCertRequest

export type TransactionRequest = WcTxRequest | InAppTxRequest

export type TypeDataRequest = WcSignDataRequest | InAppTypedDataRequest

export type ConnectAppRequest = WcConnectAppRequest | InAppConnectAppRequest

export type InAppRequest = InAppCertRequest | InAppTxRequest | InAppTypedDataRequest

export enum DAppType {
    ALL = "all",
    SUSTAINABILTY = "sustainability",
    NFT = "NFT",
    DAPPS = "DAPPS",
}

export enum X2ECategoryType {
    OTHERS = "others",
    EDUCATION_LEARNING = "education-learning",
    FITNESS_WELLNESS = "fitness-wellness",
    GREEN_FINANCE_DEFI = "green-finance-defi",
    GREEN_MOBILITY_TRAVEL = "green-mobility-travel",
    NUTRITION = "nutrition",
    PLASTIC_WASTE_RECYCLING = "plastic-waste-recycling",
    RENEWABLE_ENERGY_EFFICIENCY = "renewable-energy-efficiency",
    SUSTAINABLE_SHOPPING = "sustainable-shopping",
    PETS = "pets",
}

export const X2ECategory: Record<string, { id: X2ECategoryType; displayName: string; icon: IconKey }> = {
    OTHERS: { id: X2ECategoryType.OTHERS, displayName: "Others", icon: "icon-more-horizontal" },
    EDUCATION_LEARNING: {
        id: X2ECategoryType.EDUCATION_LEARNING,
        displayName: "Learning",
        icon: "icon-graduation-cap",
    },
    FITNESS_WELLNESS: { id: X2ECategoryType.FITNESS_WELLNESS, displayName: "Lifestyle", icon: "icon-dumbbell" },
    GREEN_FINANCE_DEFI: { id: X2ECategoryType.GREEN_FINANCE_DEFI, displayName: "Web3", icon: "icon-codesandbox" },
    GREEN_MOBILITY_TRAVEL: {
        id: X2ECategoryType.GREEN_MOBILITY_TRAVEL,
        displayName: "Transportation",
        icon: "icon-car",
    },
    NUTRITION: { id: X2ECategoryType.NUTRITION, displayName: "Food & Drinks", icon: "icon-salad" },
    PLASTIC_WASTE_RECYCLING: {
        id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
        displayName: "Recycling",
        icon: "icon-recycle",
    },
    RENEWABLE_ENERGY_EFFICIENCY: {
        id: X2ECategoryType.RENEWABLE_ENERGY_EFFICIENCY,
        displayName: "Energy",
        icon: "icon-plug",
    },
    SUSTAINABLE_SHOPPING: {
        id: X2ECategoryType.SUSTAINABLE_SHOPPING,
        displayName: "Shopping",
        icon: "icon-shopping-bag",
    },
    PETS: { id: X2ECategoryType.PETS, displayName: "Pets", icon: "icon-cat" },
}

export type VeBetterDaoDapp = {
    id: string
    teamWalletAddress: string
    name: string
    metadataURI: string
    createdAtTimestamp: string
    appAvailableForAllocationVoting?: boolean
    categories?: X2ECategoryType[]
}

export type VeBetterDaoDAppMetadata = {
    name: string
    description: string
    external_url: string
    logo: string
    banner: string
    screenshots: string[]
    social_urls: {
        name: string
        url: string
    }[]
    app_urls: {
        code: string
        url: string
    }[]
    tweets?: string[]
    ve_world?: {
        banner: string | number
    }
}
