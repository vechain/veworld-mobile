import { RequestMethods } from "~Constants"

type ErrorResponse = {
    id: number
    error: string
}

type SuccessResponse = {
    id: number
    data: Connex.Vendor.CertResponse | Connex.Vendor.TxResponse
}

export type WindowResponse = ErrorResponse | SuccessResponse

export type TxRequest = {
    id: number
    method: RequestMethods.REQUEST_TRANSACTION
    message: Connex.Vendor.TxMessage
    options: Connex.Driver.TxOptions
    genesisId: string
}

export type CertRequest = {
    id: number
    method: RequestMethods.SIGN_CERTIFICATE
    message: Connex.Vendor.CertMessage
    options: Connex.Driver.CertOptions
    genesisId: string
}

export type WindowRequest = TxRequest | CertRequest
