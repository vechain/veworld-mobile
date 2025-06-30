export enum WalletErrorType {
    SIGNATURE_REJECTED = "SIGNATURE_REJECTED",
    WALLET_NOT_FOUND = "WALLET_NOT_FOUND",
    INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
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
