import { ethers } from "ethers"
import { RequestMethods } from "~Constants"

type ErrorResponse = {
    id: string
    error: string
    method: RequestMethods.REQUEST_TRANSACTION | RequestMethods.SIGN_CERTIFICATE
}

type SuccessResponse = {
    id: string
    data: Connex.Vendor.CertResponse | Connex.Vendor.TxResponse | SignedTypedDataResponse
    method: RequestMethods.REQUEST_TRANSACTION | RequestMethods.SIGN_CERTIFICATE
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
    method: RequestMethods.REQUEST_TRANSACTION
    message: Connex.Vendor.TxMessage
    options: Connex.Signer.TxOptions
}

export type CertRequest = Omit<BaseRequest, "domain" | "origin" | "types" | "value"> & {
    method: RequestMethods.SIGN_CERTIFICATE
    message: Connex.Vendor.CertMessage
    options: Connex.Signer.CertOptions
}

export type SignedDataRequest = Omit<BaseRequest, "message"> & {
    method: RequestMethods.SIGN_TYPED_DATA
    options: Connex.Signer.CertOptions
}

export type WindowRequest = TxRequest | CertRequest | SignedDataRequest
