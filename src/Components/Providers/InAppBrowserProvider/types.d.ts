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

export type WindowRequest = TxRequest | CertRequest
