import { ErrorResponse } from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"

const errorCodes = {
    invalidInput: { code: -32000, message: "Invalid input" },
    resourceNotFound: { code: -32001, message: "Resource not found" },
    resourceUnavailable: { code: -32002, message: "Resource unavailable" },
    transactionRejected: { code: -32003, message: "Transaction rejected" },
    methodNotSupported: { code: -32004, message: "Method not supported" },
    limitExceeded: { code: -32005, message: "Limit exceeded" },
    parse: { code: -32700, message: "Parse error" },
    invalidRequest: { code: -32600, message: "Invalid request" },
    methodNotFound: { code: -32601, message: "Method not found" },
    invalidParams: { code: -32602, message: "Invalid params" },
    internal: { code: -32603, message: "Internal error" },
    userRejectedRequest: { code: 4001, message: "User rejected request" },
    unauthorized: { code: 4100, message: "Unauthorized" },
    unsupportedMethod: { code: 1234, message: "Unsupported method" },
    disconnected: { code: 4900, message: "Disconnected" },
    chainDisconnected: { code: 4901, message: "Chain disconnected" },
}

export const getRpcError = (
    type: keyof typeof errorCodes,
    data?: string,
): ErrorResponse => {
    const error = errorCodes[type]

    return {
        code: error.code,
        message: error.message,
        data,
    }
}
