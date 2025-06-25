import { Transaction } from "@vechain/sdk-core"
import { WalletAdapter, Account } from "../types/wallet"
import { TypedDataPayload } from "../types/transaction"

export abstract class BaseAdapter implements WalletAdapter {
    protected _isAuthenticated = false

    abstract signMessage(message: Buffer): Promise<Buffer>
    abstract signTransaction(tx: Transaction): Promise<Buffer>
    abstract signTypedData(data: TypedDataPayload): Promise<string>
    abstract getAccount(): Promise<Account>
    abstract logout(): Promise<void>

    get isAuthenticated(): boolean {
        return this._isAuthenticated
    }

    protected setAuthenticated(authenticated: boolean): void {
        this._isAuthenticated = authenticated
    }
}
