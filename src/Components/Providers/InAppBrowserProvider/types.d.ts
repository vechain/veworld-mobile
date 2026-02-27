import { ethers } from "ethers"
import { RequestMethods } from "~Constants"

export type ConnectResponse =
    | Connex.Vendor.CertResponse
    | (Connex.Vendor.CertResponse & { smartAccountOwnerAddress: string })
    | { signer: string; signature: string }
    | { signer: string; signature: string; smartAccountOwnerAddress: string }
    | { signer: string }
    | { signer: string; smartAccountOwnerAddress: string }
    | null

type ErrorResponse = {
    id: string
    error: string
    method: (typeof RequestMethods)[keyof typeof RequestMethods]
}

type SuccessResponse = {
    id: string
    data: Connex.Vendor.CertResponse | Connex.Vendor.TxResponse | string | ConnectResponse | string[]
    method: (typeof RequestMethods)[keyof typeof RequestMethods]
}

export type WindowResponse = ErrorResponse | SuccessResponse

interface BaseRequest {
    id: string
    method: RequestMethods
    genesisId: string
    message: Connex.Vendor.TxMessage | Connex.Vendor.CertMessage
    options: Connex.Signer.TxOptions | Connex.Signer.CertOptions
    domain: ethers.TypedDataDomain
    origin: string
    types: Record<string, ethers.TypedDataField[]>
    value: Record<string, unknown>
}

export type TxRequest = Omit<BaseRequest, "domain" | "origin" | "types" | "value"> & {
    method: (typeof RequestMethods)["REQUEST_TRANSACTION"]
    message: Connex.Vendor.TxMessage
    options: Connex.Signer.TxOptions
}

export type CertRequest = Omit<BaseRequest, "domain" | "origin" | "types" | "value"> & {
    method: (typeof RequestMethods)["SIGN_CERTIFICATE"]
    message: Connex.Vendor.CertMessage
    options: Connex.Signer.CertOptions
}

export type SignedDataRequest = Omit<BaseRequest, "message"> & {
    method: (typeof RequestMethods)["SIGN_TYPED_DATA"]
    options: Connex.Signer.CertOptions
}

type BaseRequestAPIRequest = Omit<BaseRequest, "message" | "options" | "domain" | "origin" | "types" | "value">
export type LoginRequestCertificate = BaseRequestAPIRequest & {
    method: (typeof RequestMethods)["CONNECT"]
    params: {
        value: Connex.Vendor.CertMessage
        external?: boolean
    }
}

export type LoginRequestTypedData = BaseRequestAPIRequest & {
    method: (typeof RequestMethods)["CONNECT"]
    params: {
        value: {
            domain: ethers.TypedDataDomain
            types: Record<string, ethers.TypedDataField[]>
            value: Record<string, unknown>
        }
        external?: boolean
    }
}

export type LoginRequestNull = BaseRequestAPIRequest & {
    method: (typeof RequestMethods)["CONNECT"]
    params: {
        value: null
        external?: boolean
    }
}

export type LoginRequest = LoginRequestCertificate | LoginRequestTypedData | LoginRequestNull
type WalletRequest = BaseRequestAPIRequest & {
    method: (typeof RequestMethods)["WALLET"]
    params?: undefined
}
type DisconnectRequest = BaseRequestAPIRequest & {
    method: (typeof RequestMethods)["DISCONNECT"]
    params?: undefined
}
type SwitchWalletRequest = BaseRequestAPIRequest & {
    method: (typeof RequestMethods)["SWITCH_WALLET"]
    params?: undefined
}

export type WindowRequest =
    | TxRequest
    | CertRequest
    | SignedDataRequest
    | LoginRequest
    | WalletRequest
    | DisconnectRequest
    | SwitchWalletRequest
