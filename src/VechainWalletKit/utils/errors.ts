export enum WalletErrorType {
    SIGNATURE_REJECTED = "SIGNATURE_REJECTED",
    WALLET_NOT_FOUND = "WALLET_NOT_FOUND",
    NETWORK_ERROR = "NETWORK_ERROR",
    CONTEXT_NOT_FOUND = "CONTEXT_NOT_FOUND",
}

export class WalletError extends Error {
    constructor(public type: WalletErrorType, message: string, public originalError?: unknown) {
        super(message)
        this.name = "WalletError"
        this.originalError = originalError
    }
}
