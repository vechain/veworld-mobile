import { useMemo } from "react"
import { usePrivy, useEmbeddedEthereumWallet, useLoginWithOAuth } from "@privy-io/expo"
import { Transaction, Address, ABIContract, Clause, TransactionClause } from "@vechain/sdk-core"
import { encodeFunctionData, bytesToHex } from "viem"
import { Account, SmartAccountAdapter, LoginOptions } from "../types/wallet"
import { TypedDataPayload } from "../types/transaction"
import {
    SmartAccountTransactionConfig,
    ExecuteBatchWithAuthorizationSignData,
    ExecuteWithAuthorizationSignData,
    TransactionSigningFunction,
} from "../types/transactionBuilder"
import { WalletError, WalletErrorType } from "../utils/errors"
import { SimpleAccountABI, SimpleAccountFactoryABI } from "../utils/abi"
import HexUtils from "../../Utils/HexUtils"

export const usePrivySmartAccountAdapter = (): SmartAccountAdapter => {
    const { user, logout } = usePrivy()
    const { wallets } = useEmbeddedEthereumWallet()
    const oauth = useLoginWithOAuth()

    const isAuthenticated = !!user && (wallets?.length || 0) > 0

    return useMemo(() => {
        const currentWallets = wallets || []

        return {
            isAuthenticated,

            async login(options: LoginOptions): Promise<void> {
                const provider = options.provider as any
                const redirectUri = options.oauthRedirectUri
                await oauth.login({ provider, redirectUri })
            },

            async logout(): Promise<void> {
                await logout()
            },

            async signMessage(message: Buffer): Promise<Buffer> {
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

            async getAccount(): Promise<Account> {
                if (!isAuthenticated || !currentWallets.length) {
                    throw new WalletError(
                        WalletErrorType.WALLET_NOT_FOUND,
                        "User not authenticated or no wallet available",
                    )
                }

                return {
                    address: currentWallets[0].address,
                    isDeployed: false, // This would need to be determined by smart account logic
                }
            },

            // Smart Account specific methods
            async buildSmartAccountTransaction(params: {
                txClauses: TransactionClause[]
                smartAccountConfig: SmartAccountTransactionConfig
                networkType: "mainnet" | "testnet"
            }): Promise<TransactionClause[]> {
                const { txClauses, smartAccountConfig, networkType } = params
                const { version: smartAccountVersion, hasV1SmartAccount } = smartAccountConfig

                const chainId = getChainIdFromNetworkType(networkType)
                const signTypedDataFn: TransactionSigningFunction = async typedData => {
                    return await this.signTypedData(typedData)
                }

                // Determine execution strategy based on smart account version
                const shouldUseBatchExecution = !hasV1SmartAccount || (smartAccountVersion && smartAccountVersion >= 3)

                if (shouldUseBatchExecution) {
                    return await buildBatchExecutionClauses({
                        txClauses,
                        smartAccountConfig,
                        chainId,
                        signTypedDataFn,
                    })
                } else {
                    return await buildIndividualExecutionClauses({
                        txClauses,
                        smartAccountConfig,
                        chainId,
                        signTypedDataFn,
                    })
                }
            },

            async isSmartAccountDeployed(_address: string): Promise<boolean> {
                // TODO: Implement smart account deployment check
                // This would typically involve checking if the smart account contract exists at the given address
                return false
            },

            async getSmartAccountConfig(): Promise<SmartAccountTransactionConfig> {
                // TODO: Implement smart account config retrieval
                // This would typically involve getting the smart account configuration from the wallet or provider
                throw new Error("getSmartAccountConfig not implemented")
            },
        }
    }, [isAuthenticated, wallets, oauth, logout])
}

// Helper functions moved from transactionBuilder.ts

/**
 * Common EIP712Domain type definition
 */
const EIP712_DOMAIN_TYPE = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
]

/**
 * Create the common domain structure
 */
function createDomain(chainId: number, verifyingContract: string) {
    return {
        name: "Wallet",
        version: "1",
        chainId,
        verifyingContract,
    }
}

/**
 * Calculate expiration times
 */
function getExpirationTimes(durationInSeconds: number) {
    const now = Math.floor(Date.now() / 1000)
    return {
        validAfter: 0,
        validBefore: now + durationInSeconds,
    }
}

function getChainIdFromNetworkType(networkType: "mainnet" | "testnet"): number {
    // Mainnet chain ID is the geesis block id "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a"
    // Testnet chain ID is the geesis block id "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"
    // The smart account uses the last 16 bits of the chainId, so we convert it here
    if (networkType === "mainnet") {
        return 6986
    } else if (networkType === "testnet") {
        return 45351
    }
    throw new Error(`Unsupported network type: ${networkType}`)
}

/**
 * Build the typed data structure for executeBatchWithAuthorization
 */
function buildBatchAuthorizationTypedData({
    clauses,
    chainId,
    verifyingContract,
}: {
    clauses: TransactionClause[]
    chainId: number
    verifyingContract: string
}): ExecuteBatchWithAuthorizationSignData {
    const toArray: string[] = []
    const valueArray: string[] = []
    const dataArray: string[] = []

    clauses.forEach(clause => {
        toArray.push(clause.to ?? "")
        valueArray.push(String(clause.value))
        if (typeof clause.data === "object" && "abi" in clause.data) {
            dataArray.push(encodeFunctionData(clause.data))
        } else {
            dataArray.push(clause.data || "0x")
        }
    })

    const { validAfter, validBefore } = getExpirationTimes(300) // 5 minutes

    return {
        domain: createDomain(chainId, verifyingContract),
        types: {
            ExecuteBatchWithAuthorization: [
                { name: "to", type: "address[]" },
                { name: "value", type: "uint256[]" },
                { name: "data", type: "bytes[]" },
                { name: "validAfter", type: "uint256" },
                { name: "validBefore", type: "uint256" },
                { name: "nonce", type: "bytes32" },
            ],
            EIP712Domain: EIP712_DOMAIN_TYPE,
        },
        primaryType: "ExecuteBatchWithAuthorization",
        message: {
            to: toArray,
            value: valueArray,
            data: dataArray,
            validAfter,
            validBefore,
            nonce: bytesToHex(crypto.getRandomValues(new Uint8Array(32))),
        },
    }
}

/**
 * Build the typed data structure for executeWithAuthorization
 */
function buildSingleAuthorizationTypedData({
    clause,
    chainId,
    verifyingContract,
}: {
    clause: TransactionClause
    chainId: number
    verifyingContract: string
}): ExecuteWithAuthorizationSignData {
    const { validAfter, validBefore } = getExpirationTimes(60) // 1 minute

    return {
        domain: createDomain(chainId, verifyingContract),
        types: {
            ExecuteWithAuthorization: [
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "data", type: "bytes" },
                { name: "validAfter", type: "uint256" },
                { name: "validBefore", type: "uint256" },
            ],
            EIP712Domain: EIP712_DOMAIN_TYPE,
        },
        primaryType: "ExecuteWithAuthorization",
        message: {
            validAfter,
            validBefore,
            to: clause.to,
            value: String(clause.value),
            data:
                (typeof clause.data === "object" && "abi" in clause.data
                    ? encodeFunctionData(clause.data)
                    : clause.data) || "0x",
        },
    }
}

/**
 * Build transaction clauses for batch execution (V3+ smart accounts)
 * Handles multiple clauses in a single batch transaction with one signature
 */
async function buildBatchExecutionClauses({
    txClauses,
    smartAccountConfig,
    chainId,
    signTypedDataFn,
}: {
    txClauses: TransactionClause[]
    smartAccountConfig: SmartAccountTransactionConfig
    chainId: number
    signTypedDataFn: TransactionSigningFunction
}): Promise<TransactionClause[]> {
    const clauses: TransactionClause[] = []
    const { address, isDeployed, factoryAddress } = smartAccountConfig

    // Build the batch authorization typed data
    const typedData = buildBatchAuthorizationTypedData({
        clauses: txClauses,
        chainId,
        verifyingContract: address,
    })
    const signature = await signTypedDataFn(typedData)

    // If the smart account is not deployed, deploy it first
    if (!isDeployed) {
        clauses.push(
            Clause.callFunction(
                Address.of(factoryAddress),
                ABIContract.ofAbi(SimpleAccountFactoryABI).getFunction("createAccount"),
                [address],
            ),
        )
    }

    // Add the batch execution call
    clauses.push(
        Clause.callFunction(
            Address.of(address),
            ABIContract.ofAbi(SimpleAccountABI).getFunction("executeBatchWithCustomAuthorization"),
            [
                typedData.message.to,
                typedData.message.value?.map((val: string) => BigInt(val)) ?? 0,
                typedData.message.data,
                BigInt(typedData.message.validAfter),
                BigInt(typedData.message.validBefore),
                typedData.message.nonce,
                signature as `0x${string}`,
            ],
        ),
    )
    return clauses
}

/**
 * Build transaction clauses for individual execution (V1 smart accounts)
 * Handles each clause individually with separate signatures
 */
async function buildIndividualExecutionClauses({
    txClauses,
    smartAccountConfig,
    chainId,
    signTypedDataFn,
}: {
    txClauses: TransactionClause[]
    smartAccountConfig: SmartAccountTransactionConfig
    chainId: number
    signTypedDataFn: TransactionSigningFunction
}): Promise<TransactionClause[]> {
    const clauses: TransactionClause[] = []
    const { address, isDeployed, factoryAddress } = smartAccountConfig

    // Build typed data for each clause
    const dataToSign = txClauses.map(txData =>
        buildSingleAuthorizationTypedData({
            clause: txData,
            chainId,
            verifyingContract: address,
        }),
    )

    // Get signatures for each clause
    const signatures: string[] = []
    for (let index = 0; index < dataToSign.length; index++) {
        const data = dataToSign[index]
        const txClause = txClauses[index]
        if (!txClause) {
            throw new Error(`Transaction clause at index ${index} is undefined`)
        }
        const signature = await signTypedDataFn(data)
        signatures.push(signature)
    }

    // If the smart account is not deployed, deploy it first
    if (!isDeployed) {
        clauses.push(
            Clause.callFunction(
                Address.of(factoryAddress),
                ABIContract.ofAbi(SimpleAccountFactoryABI).getFunction("createAccount"),
                [address ?? ""],
            ),
        )
    }

    // Add individual execution calls
    dataToSign.forEach((data, index) => {
        clauses.push(
            Clause.callFunction(
                Address.of(address ?? ""),
                ABIContract.ofAbi(SimpleAccountABI).getFunction("executeWithAuthorization"),
                [
                    data.message.to as `0x${string}`,
                    BigInt(data.message.value),
                    data.message.data as `0x${string}`,
                    BigInt(data.message.validAfter),
                    BigInt(data.message.validBefore),
                    signatures[index] as `0x${string}`,
                ],
            ),
        )
    })

    return clauses
}

const findPrimaryType = (types: Record<string, any>, message: any): string => {
    const typeKeys = Object.keys(types).filter(key => key !== "EIP712Domain")

    for (const typeKey of typeKeys) {
        if (message[typeKey.toLowerCase()] !== undefined) {
            return typeKey
        }
    }

    return typeKeys[0] || "Unknown"
}
