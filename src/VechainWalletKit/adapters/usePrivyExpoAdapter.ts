import { useMemo } from "react"
import { usePrivy, useEmbeddedEthereumWallet, useLoginWithOAuth } from "@privy-io/expo"
import { Transaction } from "@vechain/sdk-core"
import { SmartAccountAdapter, LoginOptions } from "../types/wallet"
import { TypedDataPayload } from "../types/transaction"
import { WalletError, WalletErrorType } from "../utils/errors"
import HexUtils from "../../Utils/HexUtils"

export const usePrivyExpoAdapter = (): SmartAccountAdapter => {
    const { user, logout } = usePrivy()
    const { wallets, create } = useEmbeddedEthereumWallet()
    const oauth = useLoginWithOAuth({
        onError: (err: any) => {
            console.log("error logging", JSON.stringify(err))
        },
    })
    const isAuthenticated = !!user

    return useMemo(() => {
        const currentWallets = wallets ?? []
        console.log("Privy isAuthenticated", isAuthenticated, currentWallets)
        return {
            isAuthenticated,

            async login(options: LoginOptions): Promise<void> {
                console.log("usePrivyExpoAdapter login", options)
                const provider = options.provider as any
                const redirectUri = options.oauthRedirectUri
                await oauth.login({ provider, redirectUri })
            },

            async logout(): Promise<void> {
                await logout()
            },

            // Will create only one wallet for the user even if called multiple times.
            async createWallet(): Promise<string> {
                if (!currentWallets?.length) {
                    await create()
                }

                return currentWallets[0].address
            },

            async signMessage(message: Buffer): Promise<Buffer> {
                console.log("usePrivyExpoAdapter signMessage", isAuthenticated, currentWallets)
                if (!isAuthenticated || !currentWallets.length) {
                    const errormessage = !isAuthenticated
                        ? "User not authenticated"
                        : "No wallet available. Please create a wallet first."
                    throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, errormessage)
                }

                try {
                    const privyProvider = await currentWallets[0].getProvider()
                    const privyAccount = currentWallets[0].address
                    const signature = await privyProvider.request({
                        method: "personal_sign",
                        params: [HexUtils.addPrefix(message.toString("hex")), privyAccount],
                    })
                    return Buffer.from(signature.slice(2), "hex")
                } catch (error) {
                    throw new WalletError(WalletErrorType.SIGNATURE_REJECTED, "Failed to sign message", error)
                }
            },

            async signTransaction(tx: Transaction): Promise<Buffer> {
                console.log("usePrivyExpoAdapter signTransaction", isAuthenticated, currentWallets)
                if (!isAuthenticated || !currentWallets.length) {
                    throw new WalletError(
                        WalletErrorType.WALLET_NOT_FOUND,
                        "User not authenticated or no wallet available",
                    )
                }

                try {
                    const privyProvider = await currentWallets[0].getProvider()
                    const hash = tx.getTransactionHash()

                    const response = await privyProvider.request({
                        method: "secp256k1_sign",
                        params: [hash.toString()],
                    })

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
            },

            async signTypedData(data: TypedDataPayload): Promise<string> {
                console.log("usePrivyExpoAdapter signTypedData", isAuthenticated, currentWallets)
                if (!isAuthenticated || !currentWallets.length) {
                    throw new WalletError(
                        WalletErrorType.WALLET_NOT_FOUND,
                        "User not authenticated or no wallet available",
                    )
                }

                try {
                    const privyProvider = await currentWallets[0].getProvider()
                    const privyAccount = currentWallets[0].address
                    console.log("privyAccount", privyAccount)
                    const signature = await privyProvider.request({
                        method: "eth_signTypedData_v4",
                        params: [
                            privyAccount,
                            JSON.stringify({
                                domain: data.domain,
                                types: data.types,
                                primaryType: findPrimaryType(data.types, data.message),
                                message: data.message,
                            }),
                        ],
                    })
                    return signature
                } catch (error) {
                    throw new WalletError(WalletErrorType.SIGNATURE_REJECTED, "Failed to sign typed data", error)
                }
            },

            getAccount(): string {
                if (!isAuthenticated) {
                    throw new WalletError(
                        WalletErrorType.WALLET_NOT_FOUND,
                        "User not authenticated or no wallet available",
                    )
                }

                return currentWallets[0]?.address ?? ""
            },
        }
    }, [isAuthenticated, wallets, oauth, logout, create])
}

export const findPrimaryType = (types: Record<string, any>, message: any): string => {
    const typeKeys = Object.keys(types).filter(key => key !== "EIP712Domain")

    for (const typeKey of typeKeys) {
        if (message[typeKey.toLowerCase()] !== undefined) {
            return typeKey
        }
    }

    return typeKeys[0] ?? "Unknown"
}
