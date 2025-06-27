import { WalletAdapter, Account } from "../../types/wallet"

interface MockAdapterOptions {
    isAuthenticated?: boolean
    account?: Account
    signMessageResult?: Buffer
    signTransactionResult?: Buffer
    signTypedDataResult?: string
}

class MockAdapter implements WalletAdapter {
    private _isAuthenticated: boolean
    private _account: Account
    private _signMessageResult: Buffer
    private _signTransactionResult: Buffer
    private _signTypedDataResult: string

    constructor(options: MockAdapterOptions = {}) {
        const {
            isAuthenticated = false,
            account = { address: "", isDeployed: false },
            signMessageResult = Buffer.from("mock-signature"),
            signTransactionResult = Buffer.from("mock-tx-signature"),
            signTypedDataResult = "mock-typed-data-signature",
        } = options

        this._isAuthenticated = isAuthenticated
        this._account = account
        this._signMessageResult = signMessageResult
        this._signTransactionResult = signTransactionResult
        this._signTypedDataResult = signTypedDataResult

        // Make methods spies
        this.signMessage = jest.fn().mockResolvedValue(this._signMessageResult)
        this.signTransaction = jest.fn().mockResolvedValue(this._signTransactionResult)
        this.signTypedData = jest.fn().mockResolvedValue(this._signTypedDataResult)
        this.getAccount = jest.fn().mockResolvedValue(this._account)
        this.login = jest.fn().mockResolvedValue(undefined)
        this.logout = jest.fn().mockResolvedValue(undefined)
    }

    get isAuthenticated(): boolean {
        return this._isAuthenticated
    }

    // Method to change authentication state for testing
    setAuthenticated(isAuthenticated: boolean): void {
        this._isAuthenticated = isAuthenticated
    }

    // Method to update account for testing
    setAccount(account: Account): void {
        this._account = account
        ;(this.getAccount as jest.Mock).mockResolvedValue(account)
    }

    signMessage = jest.fn()
    signTransaction = jest.fn()
    signTypedData = jest.fn()
    getAccount = jest.fn()
    login = jest.fn()
    logout = jest.fn()
}

export const createMockAdapter = (options: MockAdapterOptions = {}): MockAdapter => {
    return new MockAdapter(options)
}

export const createFailingAdapter = (): MockAdapter => {
    const adapter = new MockAdapter({ isAuthenticated: false })
    adapter.signMessage.mockRejectedValue(new Error("Signing failed"))
    adapter.signTransaction.mockRejectedValue(new Error("Transaction signing failed"))
    adapter.signTypedData.mockRejectedValue(new Error("Typed data signing failed"))
    adapter.getAccount.mockRejectedValue(new Error("Account fetch failed"))
    adapter.login.mockRejectedValue(new Error("Login failed"))
    adapter.logout.mockRejectedValue(new Error("Logout failed"))
    return adapter
}
