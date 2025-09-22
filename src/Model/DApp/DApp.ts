import { PendingRequestTypes, SessionTypes, SignClientTypes } from "@walletconnect/types"
import { ethers } from "ethers"

export type DAppSourceType = "wallet-connect" | "in-app" | "external-app"
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
    options: Connex.Signer.CertOptions
    method: "thor_signTypedData"
    origin: string
} & TypedDataMessage

type BaseExternalConnectAppRequest = BaseRequest & {
    type: "external-app"
    publicKey: string
    redirectUrl: string
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

export type DisconnectAppRequest = BaseExternalAppRequest & {
    genesisId: string
}

/**
 * Login request. WC doesn't support it, so it'll be only in-app
 */
export type LoginRequest = InAppLoginRequest

export type ConnectAppRequest = WcConnectAppRequest | InAppConnectAppRequest | BaseExternalConnectAppRequest

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
