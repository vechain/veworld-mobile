import { PendingRequestTypes, SessionTypes, SignClientTypes } from "@walletconnect/types"
import { ethers } from "ethers"

export type DAppSourceType = "wallet-connect" | "in-app" | "external-app"

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

export type BaseExternalAppRequest = BaseRequest & {
    type: "external-app"
    publicKey: string
    nonce: string
    session: string
    redirectUrl: string
    genesisId: string
}

type BaseCertificateRequest = {
    message: Connex.Vendor.CertMessage
    options: Connex.Signer.CertOptions
    method: "thor_signCertificate"
}

export type BaseTransactionRequest = {
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

type BaseExternalConnectAppRequest = BaseRequest & {
    type: "external-app"
    publicKey: string
    redirectUrl: string
    genesisId: string
}

type BaseExternalDisconnectAppRequest = BaseExternalAppRequest & {
    genesisId: string
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

type ExternalAppCertRequest = BaseCertificateRequest & BaseExternalAppRequest

type WcTxRequest = BaseTransactionRequest & BaseWcRequest

type InAppTxRequest = BaseTransactionRequest & BaseInAppRequest

type ExternalAppTxRequest = BaseTransactionRequest & BaseExternalAppRequest

type WcSignDataRequest = BaseTypedDataRequest & BaseWcRequest

type InAppTypedDataRequest = BaseTypedDataRequest & BaseInAppRequest

type ExternalAppTypedDataRequest = BaseTypedDataRequest & BaseExternalAppRequest

export type CertificateRequest = WcCertRequest | InAppCertRequest | ExternalAppCertRequest

export type TransactionRequest = WcTxRequest | InAppTxRequest | ExternalAppTxRequest

export type TypeDataRequest = WcSignDataRequest | InAppTypedDataRequest | ExternalAppTypedDataRequest

export type ConnectAppRequest = WcConnectAppRequest | InAppConnectAppRequest | BaseExternalConnectAppRequest

export type DisconnectAppRequest = BaseExternalDisconnectAppRequest

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

export type ExternalAppRequest = BaseExternalAppRequest & {
    /**
     * The payload is the encrypted and base64 encoded payload from the external app
     * It is encrypted with the public key of the session
     * It is decrypted with the private key of the session
     * It is then parsed into a TransactionRequest
     */
    payload: string
}

type ExternalRequestParsedPayload<T> = {
    transaction?: T
    typedData?: T
    certificate?: T
    session: string
}

/**
 * Request parsed from the external app encrypted payload
 */
export type ParsedRequest<T> = {
    payload: ExternalRequestParsedPayload<T>
    request: BaseExternalAppRequest
}

/**
 * Request decoded from the external app
 */
export type DecodedRequest = BaseExternalAppRequest & { payload: string }
