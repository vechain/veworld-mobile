import { ethers } from "ethers"
import { RequestMethods } from "~Constants"

type ErrorResponse = {
    id: string
    error: string
    method: (typeof RequestMethods)[keyof typeof RequestMethods]
}

type SuccessResponse = {
    id: string
    data: Connex.Vendor.CertResponse | Connex.Vendor.TxResponse | SignedTypedDataResponse
    method: (typeof RequestMethods)["REQUEST_TRANSACTION"] | (typeof RequestMethods)["SIGN_CERTIFICATE"]
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

type BaseConnectRequest = Omit<BaseRequest, "message" | "options" | "domain" | "origin" | "types" | "value">
export type ConnectRequestCertificate = BaseConnectRequest & {
    method: (typeof RequestMethods)["CONNECT"]
    params: {
        value: Connex.Vendor.CertMessage
        external?: boolean
    }
}

export type ConnectRequestTypedData = BaseConnectRequest & {
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

export type ConnectRequestNull = BaseConnectRequest & {
    method: (typeof RequestMethods)["CONNECT"]
    params: {
        value: null
        external?: boolean
    }
}

export type ConnectRequest = ConnectRequestCertificate | ConnectRequestTypedData | ConnectRequestNull

export type WindowRequest = TxRequest | CertRequest | SignedDataRequest | ConnectRequest
