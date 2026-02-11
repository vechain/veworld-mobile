import { useMemo } from "react"
import {
    usePrivy,
    useEmbeddedEthereumWallet,
    useLoginWithOAuth,
    useLinkWithOAuth,
    useUnlinkOAuth,
    LinkWithOAuthInput,
} from "@privy-io/expo"
import { Transaction } from "@vechain/sdk-core"
import { SmartAccountAdapter, LoginOptions, LinkedAccount, SocialProvider } from "../types/wallet"
import { TypedDataPayload } from "../types/transaction"
import { WalletError, WalletErrorType } from "../utils/errors"
import HexUtils from "../../Utils/HexUtils"

const OAUTH_TYPE_TO_PROVIDER: Record<string, SocialProvider> = {
    google_oauth: "google",
    apple_oauth: "apple",
    twitter_oauth: "twitter",
}

export const usePrivyExpoAdapter = (): SmartAccountAdapter => {
    const { user, isReady, logout } = usePrivy()
    const { wallets, create } = useEmbeddedEthereumWallet()
    const oauth = useLoginWithOAuth()
    const unlinkOAuth = useUnlinkOAuth()
    const linkOAuth = useLinkWithOAuth()

    const isAuthenticated = false

    const linkedAccounts: LinkedAccount[] = useMemo(() => {
        if (!user?.linked_accounts) return []
        return user.linked_accounts
            .filter(account => account.type in OAUTH_TYPE_TO_PROVIDER)
            .map(account => ({
                type: OAUTH_TYPE_TO_PROVIDER[account.type],
                email: "email" in account ? account.email : undefined,
                subject: "subject" in account ? account.subject : "",
            }))
    }, [user?.linked_accounts])

    const userDisplayName: string | null = useMemo(() => {
        if (!user?.linked_accounts) return null

        for (const account of user.linked_accounts) {
            if (account.type === "google_oauth") {
                return account.name ?? account.email
            }
            if (account.type === "apple_oauth") {
                return account.email ?? null
            }
        }
        return null
    }, [user?.linked_accounts])

    const hasMultipleSocials = useMemo(() => {
        return linkedAccounts.length > 1
    }, [linkedAccounts])

    return useMemo(() => {
        const currentWallets = wallets ?? []
        return {
            isAuthenticated,
            isReady,
            linkedAccounts,
            userDisplayName,
            hasMultipleSocials,
            linkOAuth: {
                ...linkOAuth.state,
                link: async (provider: SocialProvider, opts?: Omit<LinkWithOAuthInput, "provider">) => {
                    return await linkOAuth.link({ provider, redirectUri: "auth/callback", ...opts })
                },
            },

            async login(options: LoginOptions): Promise<void> {
                const provider = options.provider as any
                const redirectUri = options.oauthRedirectUri
                await oauth.login({ provider, redirectUri })
            },

            async logout(): Promise<void> {
                await logout()
            },

            async unlinkOAuth(provider: SocialProvider, subject?: string) {
                return await unlinkOAuth.unlinkOAuth({ provider, subject: subject ?? "" })
            },

            // Will create only one wallet for the user even if called multiple times.
            async createWallet(): Promise<string> {
                if (!currentWallets?.length) {
                    await create()
                }

                return currentWallets[0].address
            },

            async signMessage(message: Buffer): Promise<Buffer> {
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
                if (!isAuthenticated || !currentWallets.length) {
                    throw new WalletError(
                        WalletErrorType.WALLET_NOT_FOUND,
                        "User not authenticated or no wallet available",
                    )
                }

                try {
                    const privyProvider = await currentWallets[0].getProvider()
                    const privyAccount = currentWallets[0].address
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
    }, [
        isAuthenticated,
        linkedAccounts,
        userDisplayName,
        wallets,
        oauth,
        hasMultipleSocials,
        logout,
        create,
        isReady,
        linkOAuth,
        unlinkOAuth,
    ])
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
