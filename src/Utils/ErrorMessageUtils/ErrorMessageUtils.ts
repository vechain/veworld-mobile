export const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message
    return String(error)
}

export enum DeepLinkErrorCode {
    Disconnected = 4900,
    Unauthorized = 4100,
    UserRejected = 4001,
    ResourceNotAvailable = -32002,
    TransactionRejected = -32003,
    InvalidPayload = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
}

export const getDeepLinkErrorName = (code: DeepLinkErrorCode) => {
    switch (code) {
        case DeepLinkErrorCode.Unauthorized:
            return "Unauthorized"
        case DeepLinkErrorCode.UserRejected:
            return "User Rejected Request"
        case DeepLinkErrorCode.InvalidPayload:
            return "Invalid Payload"
        case DeepLinkErrorCode.InvalidParams:
            return "Invalid Parameters"
        case DeepLinkErrorCode.ResourceNotAvailable:
            return "Resource Not Available"
        case DeepLinkErrorCode.TransactionRejected:
            return "Transaction Rejected"
        case DeepLinkErrorCode.MethodNotFound:
            return "Method Not Found"
        case DeepLinkErrorCode.InternalError:
            return "Internal Error"
        case DeepLinkErrorCode.Disconnected:
            return "Disconnected"
        default:
            return "Internal Error"
    }
}

export const getDeepLinkErrorMessage = (code: DeepLinkErrorCode) => {
    switch (code) {
        case DeepLinkErrorCode.Unauthorized:
            return "The requested method and/or account has not been authorized by the user."
        case DeepLinkErrorCode.UserRejected:
            return "The user rejected the request through VeWorld."
        case DeepLinkErrorCode.InvalidPayload:
            return "The payload is invalid."
        case DeepLinkErrorCode.InvalidParams:
            return "Missing or invalid parameters."
        case DeepLinkErrorCode.ResourceNotAvailable:
            // eslint-disable-next-line max-len
            return "This error occurs when a dapp attempts to submit a new transaction while VeWorld's approval dialog is already open for a previous transaction. Only one approve window can be open at a time. Users should  approve or reject their transaction before initiating a new transaction."
        case DeepLinkErrorCode.TransactionRejected:
            return "VeWorld does not recognize a valid transaction."
        case DeepLinkErrorCode.MethodNotFound:
            return "VeWorld does not recognize the requested method."
        case DeepLinkErrorCode.InternalError:
            return "Something went wrong within VeWorld"
        case DeepLinkErrorCode.Disconnected:
            return "VeWorld could not connect to the network."
        default:
            return "Something went wrong within VeWorld"
    }
}

export class DeepLinkError extends Error {
    constructor(public code: DeepLinkErrorCode) {
        super()
        this.code = code
        this.name = getDeepLinkErrorName(code)
        this.message = getDeepLinkErrorMessage(code)
    }
}
