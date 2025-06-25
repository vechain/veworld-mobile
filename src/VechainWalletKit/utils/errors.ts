export enum WalletErrorType {
    CONNECTION_FAILED = "CONNECTION_FAILED",
    TRANSACTION_FAILED = "TRANSACTION_FAILED",
    SIGNATURE_REJECTED = "SIGNATURE_REJECTED",
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
    WALLET_NOT_FOUND = "WALLET_NOT_FOUND",
    INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
    NETWORK_ERROR = "NETWORK_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class WalletError extends Error {
    constructor(public type: WalletErrorType, message: string, public originalError?: unknown) {
        super(message)
        this.name = "WalletError"
    }
}

export const createWalletError = (type: WalletErrorType, message: string, originalError?: unknown): WalletError => {
    return new WalletError(type, message, originalError)
}
