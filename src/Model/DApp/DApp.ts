import { PendingRequestTypes, SessionTypes, SignClientTypes } from "@walletconnect/types"

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

type WcConnectAppRequest = BaseRequest & {
    type: "wallet-connect"
    proposal: SignClientTypes.EventArguments["session_proposal"]
}

type InAppConnectAppRequest = BaseRequest & {
    type: "in-app"
    initialRequest: InAppCertRequest | InAppTxRequest
}

type WcCertRequest = BaseCertificateRequest & BaseWcRequest

type InAppCertRequest = BaseCertificateRequest & BaseInAppRequest

type WcTxRequest = BaseTransactionRequest & BaseWcRequest

type InAppTxRequest = BaseTransactionRequest & BaseInAppRequest

export type CertificateRequest = WcCertRequest | InAppCertRequest

export type TransactionRequest = WcTxRequest | InAppTxRequest

export type ConnectAppRequest = WcConnectAppRequest | InAppConnectAppRequest

export type InAppRequest = InAppCertRequest | InAppTxRequest

export enum DAppType {
    ALL = "all",
    SUSTAINABILTY = "sustainability",
    NFT = "NFT",
    DAPPS = "DAPPS",
}
