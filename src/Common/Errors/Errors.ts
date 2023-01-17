import { errorCodes } from "eth-rpc-errors"
import { isVeWorldError, VeWorldError } from "./VeWorldError"
import { getMessageFromCode, isValidCode } from "eth-rpc-errors/dist/utils"

export type ErrorParams = {
    error?: unknown
    message?: string
    translationKey?: string
}

export type ErrorType = "rpc" | "provider"

/**
 * All rpc error constructor have the same parameter:
 * @field 'params' {@link ErrorParams}
 */

export const veWorldErrors = {
    rpc: {
        /**
         * Get a JSON RPC 2.0 Parse (-32700) error.
         */
        parse: (params: ErrorParams) =>
            createError(errorCodes.rpc.parse, params),

        /**
         * Get a JSON RPC 2.0 Internal (-32603) error.
         */
        internal: (params: ErrorParams) =>
            createError(errorCodes.rpc.internal, params),

        /**
         * Get an Ethereum JSON RPC Resource Unavailable (-32002) error.
         */
        resourceUnavailable: (params: ErrorParams) =>
            createError(errorCodes.rpc.resourceUnavailable, params),

        /**
         * Get an Ethereum JSON RPC Transaction Rejected (-32003) error.
         */
        transactionRejected: (params: ErrorParams) =>
            createError(errorCodes.rpc.transactionRejected, params),

        /**
         * Get a JSON RPC 2.0 Server error.
         * Permits integer error codes in the [ -32099 <= -32005 ] range.
         * Codes -32000 through -32004 are reserved by EIP-1474.
         */
        server: (errorCode: number, params: ErrorParams) => {
            if (
                !Number.isInteger(errorCode) ||
                errorCode > -32005 ||
                errorCode < -32099
            ) {
                throw new Error(
                    '"code" must be an integer such that: -32099 <= code <= -32005',
                )
            }
            return createError(errorCode, params)
        },
        /**
         * Client facing errors. These errors may have a message that is relevant to the user
         *
         * All rpc errors have the same parameters:
         * @field 'i18nKeyOrMessage' - An i18n key or an error message
         *
         */

        /**
         * Get a JSON RPC 2.0 Invalid Request (-32600) error.
         */
        invalidRequest: (params: ErrorParams) =>
            createError(errorCodes.rpc.invalidRequest, params),

        /**
         * Get a JSON RPC 2.0 Invalid Params (-32602) error.
         */
        invalidParams: (params: ErrorParams) =>
            createError(errorCodes.rpc.invalidParams, params),

        /**
         * Get a JSON RPC 2.0 Method Not Found (-32601) error.
         */
        methodNotFound: (params: ErrorParams) =>
            createError(errorCodes.rpc.methodNotFound, params),

        /**
         * Get an Ethereum JSON RPC Invalid Input (-32000) error.
         */
        invalidInput: (params: ErrorParams) =>
            createError(errorCodes.rpc.invalidInput, params),

        /**
         * Get an Ethereum JSON RPC Resource Not Found (-32001) error.
         */
        resourceNotFound: (params: ErrorParams) =>
            createError(errorCodes.rpc.resourceNotFound, params),

        /**
         * Get an Ethereum JSON RPC Method Not Supported (-32004) error.
         */
        methodNotSupported: (params: ErrorParams) =>
            createError(errorCodes.rpc.methodNotSupported, params),

        /**
         * Get an Ethereum JSON RPC Limit Exceeded (-32005) error.
         */
        limitExceeded: (params: ErrorParams) =>
            createError(errorCodes.rpc.limitExceeded, params),
    },

    provider: {
        /**
         * Get an Ethereum Provider User Rejected Request (4001) error.
         */
        userRejectedRequest: (params: ErrorParams) =>
            createError(errorCodes.provider.userRejectedRequest, params),

        /**
         * Get an Ethereum Provider Unauthorized (4100) error.
         */
        unauthorized: (params: ErrorParams) =>
            createError(errorCodes.provider.unauthorized, params),

        /**
         * Get an Ethereum Provider Unsupported Method (4200) error.
         */
        unsupportedMethod: (params: ErrorParams) =>
            createError(errorCodes.provider.unsupportedMethod, params),

        /**
         * Get an Ethereum Provider Not Connected (4900) error.
         */
        disconnected: (params: ErrorParams) =>
            createError(errorCodes.provider.disconnected, params),

        /**
         * Get an Ethereum Provider Chain Not Connected (4901) error.
         */
        chainDisconnected: (params: ErrorParams) =>
            createError(errorCodes.provider.chainDisconnected, params),

        /**
         * Get a custom Ethereum Provider error.
         */
        custom: (errorCode: number, params: ErrorParams) => {
            if (
                !Number.isInteger(errorCode) ||
                errorCode > -32005 ||
                errorCode < -32099
            ) {
                throw new Error(
                    '"code" must be an integer such that: -32099 <= code <= -32005',
                )
            }
            return createError(errorCode, params)
        },
    },
}

/**
 * handles errors that are thrown up the stack.
 * We don't want to keep catching errors and throwing generic errors
 * @param code {number} - the Ethereum JSON RPC Error code
 * @param params - {@link ErrorParams}
 */
const createError = (code: number, params: ErrorParams): VeWorldError => {
    if (isVeWorldError(params.error)) return params.error as VeWorldError

    let errMessage

    if (params.error instanceof Error) errMessage = params.error.message

    const message =
        params.message ||
        errMessage ||
        params.translationKey ||
        getMessageFromCode(code)

    return new VeWorldError(code, message, params.translationKey)
}

/**
 * @param code {number} - the Ethereum JSON RPC Error code
 * @returns {ErrorType} - `rpc` OR `provider`
 */
export const getErrorType = (code: number): ErrorType | undefined => {
    const rpcErrors = errorCodes.rpc as Record<string, number>
    const rpcError = Object.keys(rpcErrors).find(k => rpcErrors[k] === code)
    if (rpcError) return "rpc"

    const providerErrors = errorCodes.provider as Record<string, number>
    const providerError = Object.keys(providerErrors).find(
        k => providerErrors[k] === code,
    )
    if (providerError) return "provider"
}

/**
 * @param code {number} - the Ethereum JSON RPC Error code
 * @param type {ErrorType} - `rpc` OR `provider`
 * @returns the method relating to the error code
 */
export const getErrorName = (
    code: number,
    type: ErrorType,
): string | undefined => {
    if (!isValidCode(code)) throw veWorldErrors.rpc.invalidParams({})

    if (isJsonRpcServerError(code)) {
        return "server"
    }

    const rpcOrProvider = errorCodes[type] as Record<string, number>

    return Object.keys(rpcOrProvider).find(k => rpcOrProvider[k] === code)
}

function isJsonRpcServerError(code: number): boolean {
    return code >= -32099 && code <= -32000
}
