import { ethers } from "ethers"
import { RequestMethods } from "~Constants"

type ErrorResponse = {
    id: string
    error: string
    method: RequestMethods.REQUEST_TRANSACTION | RequestMethods.SIGN_CERTIFICATE
}

type SuccessResponse = {
    id: string
    data: Connex.Vendor.CertResponse | Connex.Vendor.TxResponse
    method: RequestMethods.REQUEST_TRANSACTION | RequestMethods.SIGN_CERTIFICATE
}

export type WindowResponse = ErrorResponse | SuccessResponse

export type TxRequest = {
    id: string
    method: RequestMethods.REQUEST_TRANSACTION
    message: Connex.Vendor.TxMessage
    options: Connex.Signer.TxOptions
    genesisId: string
}

export type CertRequest = {
    id: string
    method: RequestMethods.SIGN_CERTIFICATE
    message: Connex.Vendor.CertMessage
    options: Connex.Signer.CertOptions
    genesisId: string
}

export type SignedDataRequest = {
    domain: ethers.TypedDataDomain
    genesisId: string
    id: string
    method: RequestMethods.SIGN_TYPED_DATA
    origin: string
    types: Record<string, ethers.TypedDataField[]>
    value: Record<string, unknown>
    options: Connex.Signer.CertOptions
}

export type WindowRequest = TxRequest | CertRequest
