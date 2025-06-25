import { Transaction } from "@vechain/sdk-core"
import { BaseAdapter } from "./BaseAdapter"
import { Account } from "../types/wallet"
import { TypedDataPayload } from "../types/transaction"
import { WalletError, WalletErrorType } from "../utils/errors"
import { HexUtils } from "../../Utils"

export class PrivyAdapter extends BaseAdapter {
    private user: any = null
    private wallets: any[] = []
    private privyLogout: (() => Promise<void>) | null = null

    constructor(
        private getUser: () => any,
        private getWallets: () => any[],
        private getPrivyLogout: () => (() => Promise<void>) | null,
    ) {
        super()
        this.updateState()
    }

    private updateState(): void {
        this.user = this.getUser()
        this.wallets = this.getWallets()
        this.privyLogout = this.getPrivyLogout()
        this.setAuthenticated(!!this.user && this.wallets.length > 0)
    }

    async logout(): Promise<void> {
        this.updateState()
        if (this.privyLogout) {
            await this.privyLogout()
        }
        this.user = null
        this.wallets = []
        this.setAuthenticated(false)
    }

    async signMessage(message: Buffer): Promise<Buffer> {
        this.updateState()
        if (!this._isAuthenticated || !this.wallets.length) {
            throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated or no wallet available")
        }

        try {
            const privyProvider = await this.wallets[0].getProvider()
            const privyAccount = this.wallets[0].address
            const signature = await privyProvider.request({
                method: "personal_sign",
                params: [HexUtils.addPrefix(message.toString("hex")), privyAccount],
            })
            return Buffer.from(signature.slice(2), "hex")
        } catch (error) {
            throw new WalletError(WalletErrorType.SIGNATURE_REJECTED, "Failed to sign message", error)
        }
    }

    async signTransaction(tx: Transaction): Promise<Buffer> {
        console.log("signTransaction", tx)
        this.updateState()
        if (!this._isAuthenticated || !this.wallets.length) {
            throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated or no wallet available")
        }

        try {
            const privyProvider = await this.wallets[0].getProvider()
            const hash = tx.getTransactionHash()
            console.log("Calling privy to sign transaction")
            const response = await privyProvider.request({
                method: "secp256k1_sign",
                params: [hash.toString()],
            })
            console.log("Response from privy", response)
            // Process signature format
            const signatureHex = response.slice(2)
            const r = signatureHex.slice(0, 64)
            const s = signatureHex.slice(64, 128)
            const v = signatureHex.slice(128, 130)

            let vAdjusted = parseInt(v, 16)
            if (vAdjusted === 27 || vAdjusted === 28) {
                vAdjusted -= 27
            }

            const adjustedSignature = `${r}${s}${vAdjusted.toString(16).padStart(2, "0")}`
            return Buffer.from(adjustedSignature, "hex")
        } catch (error) {
            throw new WalletError(WalletErrorType.SIGNATURE_REJECTED, "Failed to sign transaction", error)
        }
    }

    async signTypedData(data: TypedDataPayload): Promise<string> {
        console.log("signTypedData", data)
        this.updateState()
        if (!this._isAuthenticated || !this.wallets.length) {
            throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated or no wallet available")
        }

        try {
            const privyProvider = await this.wallets[0].getProvider()
            const privyAccount = this.wallets[0].address
            console.log("requesting sign for typed data privy")
            const signature = await privyProvider.request({
                method: "eth_signTypedData_v4",
                params: [
                    privyAccount,
                    JSON.stringify({
                        domain: data.domain,
                        types: data.types,
                        primaryType: this.findPrimaryType(data.types, data.message),
                        message: data.message,
                    }),
                ],
            })
            console.log("signature", signature)
            return signature
        } catch (error) {
            throw new WalletError(WalletErrorType.SIGNATURE_REJECTED, "Failed to sign typed data", error)
        }
    }

    async getAccount(): Promise<Account> {
        this.updateState()
        if (!this._isAuthenticated || !this.wallets.length) {
            throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "User not authenticated or no wallet available")
        }

        return {
            address: this.wallets[0].address,
            isDeployed: false, // This would need to be determined by smart account logic
        }
    }

    private findPrimaryType(types: Record<string, any>, message: any): string {
        const typeKeys = Object.keys(types).filter(key => key !== "EIP712Domain")

        for (const typeKey of typeKeys) {
            if (message[typeKey.toLowerCase()] !== undefined) {
                return typeKey
            }
        }

        return typeKeys[0] || "Unknown"
    }
}
