import { PendingRequestTypes, SessionTypes, SignClientTypes } from "@walletconnect/types"
import { ethers } from "ethers"

export type DAppSourceType = "wallet-connect" | "in-app"
export type TypedDataMessage = {
    domain: ethers.TypedDataDomain
    types: Record<string, ethers.TypedDataField[]>
    value: Record<string, unknown>
}

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
    options: Connex.Signer.CertOptions
    method: "thor_signTypedData"
    origin: string
} & TypedDataMessage

type WcConnectAppRequest = BaseRequest & {
    type: "wallet-connect"
    proposal: SignClientTypes.EventArguments["session_proposal"]
}

type InAppConnectAppRequest = BaseRequest & {
    type: "in-app"
    initialRequest: InAppCertRequest | InAppTxRequest | InAppTypedDataRequest
}

type InAppLoginRequest = BaseInAppRequest & {
    method: "thor_connect"
    external: boolean | undefined
    genesisId: string
} & (
        | { kind: "simple"; value: null }
        | { kind: "certificate"; value: Connex.Vendor.CertMessage }
        | {
              kind: "typed-data"
              value: TypedDataMessage
          }
    )

type InAppSwitchWalletRequest = BaseInAppRequest & {
    method: "thor_switchWallet"
    genesisId: string
}

type InAppWalletRequest = BaseInAppRequest & {
    method: "thor_wallet"
    genesisId: string
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

/**
 * Login request. WC doesn't support it, so it'll be only in-app
 */
export type LoginRequest = InAppLoginRequest

export type ConnectAppRequest = WcConnectAppRequest | InAppConnectAppRequest

export type SwitchWalletRequest = InAppSwitchWalletRequest
export type WalletRequest = InAppWalletRequest

export type InAppRequest =
    | InAppCertRequest
    | InAppTxRequest
    | InAppTypedDataRequest
    | InAppLoginRequest
    | InAppSwitchWalletRequest

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
        banner: string
        featured_image?: string
    }
    categories?: string[]
}

export type VbdDApp = VeBetterDaoDapp & VeBetterDaoDAppMetadata
