import { useCallback, useMemo } from "react"
import { Address, ABIContract, Clause, TransactionClause } from "@vechain/sdk-core"
import { encodeFunctionData, bytesToHex } from "viem"
import {
    TransactionSigningFunction,
    SmartAccountTransactionConfig,
    TransactionNetworkConfig,
    ExecuteBatchWithAuthorizationSignData,
    ExecuteWithAuthorizationSignData,
} from "../types/transactionBuilder"
import { SimpleAccountABI, SimpleAccountFactoryABI } from "../utils/abi"

export interface UseTransactionBuilderProps {
    signTypedDataFn: TransactionSigningFunction
}

export interface SmartWalletTransactionClausesParams {
    txClauses: TransactionClause[]
    smartAccountConfig: SmartAccountTransactionConfig
    networkConfig: TransactionNetworkConfig
    selectedAccountAddress?: string
}

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
 * Process clause data (handle ABI encoding)
 */
function processClauseData(clause: TransactionClause): string {
    if (typeof clause.data === "object" && "abi" in clause.data) {
        return encodeFunctionData(clause.data)
    }
    return clause.data || "0x"
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
        dataArray.push(processClauseData(clause))
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
            data: processClauseData(clause),
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
    networkConfig,
    signTypedDataFn,
}: {
    txClauses: TransactionClause[]
    smartAccountConfig: SmartAccountTransactionConfig
    networkConfig: TransactionNetworkConfig
    signTypedDataFn: TransactionSigningFunction
}): Promise<TransactionClause[]> {
    const clauses: TransactionClause[] = []
    const {
        address: smartAccountAddress,
        isDeployed: smartAccountIsDeployed,
        factoryAddress: smartAccountFactoryAddress,
    } = smartAccountConfig
    const { chainId } = networkConfig

    // Build the batch authorization typed data
    const typedData = buildBatchAuthorizationTypedData({
        clauses: txClauses,
        chainId,
        verifyingContract: smartAccountAddress,
    })

    const signature = await signTypedDataFn(typedData)

    // If the smart account is not deployed, deploy it first
    if (!smartAccountIsDeployed) {
        clauses.push(
            Clause.callFunction(
                Address.of(smartAccountFactoryAddress),
                ABIContract.ofAbi(SimpleAccountFactoryABI).getFunction("createAccount"),
                [smartAccountAddress],
            ),
        )
    }

    // Add the batch execution call
    clauses.push(
        Clause.callFunction(
            Address.of(smartAccountAddress),
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
    networkConfig,
    selectedAccountAddress,
    signTypedDataFn,
}: {
    txClauses: TransactionClause[]
    smartAccountConfig: SmartAccountTransactionConfig
    networkConfig: TransactionNetworkConfig
    selectedAccountAddress?: string
    signTypedDataFn: TransactionSigningFunction
}): Promise<TransactionClause[]> {
    const clauses: TransactionClause[] = []
    const {
        address: smartAccountAddress,
        isDeployed: smartAccountIsDeployed,
        factoryAddress: smartAccountFactoryAddress,
    } = smartAccountConfig
    const { chainId } = networkConfig

    // Build typed data for each clause
    const dataToSign = txClauses.map(txData =>
        buildSingleAuthorizationTypedData({
            clause: txData,
            chainId,
            verifyingContract: smartAccountAddress,
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
    if (!smartAccountIsDeployed) {
        clauses.push(
            Clause.callFunction(
                Address.of(smartAccountFactoryAddress),
                ABIContract.ofAbi(SimpleAccountFactoryABI).getFunction("createAccount"),
                [selectedAccountAddress ?? ""],
            ),
        )
    }

    // Add individual execution calls
    dataToSign.forEach((data, index) => {
        clauses.push(
            Clause.callFunction(
                Address.of(smartAccountAddress ?? ""),
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

export function useTransactionBuilder({ signTypedDataFn }: UseTransactionBuilderProps) {
    const buildSmartWalletTransactionClauses = useCallback(
        async ({
            txClauses,
            smartAccountConfig,
            networkConfig,
            selectedAccountAddress,
        }: SmartWalletTransactionClausesParams): Promise<TransactionClause[]> => {
            const { version: smartAccountVersion, hasV1SmartAccount } = smartAccountConfig

            // Determine execution strategy based on smart account version
            const shouldUseBatchExecution = !hasV1SmartAccount || (smartAccountVersion && smartAccountVersion >= 3)

            if (shouldUseBatchExecution) {
                return await buildBatchExecutionClauses({
                    txClauses,
                    smartAccountConfig,
                    networkConfig,
                    signTypedDataFn,
                })
            } else {
                return await buildIndividualExecutionClauses({
                    txClauses,
                    smartAccountConfig,
                    networkConfig,
                    selectedAccountAddress,
                    signTypedDataFn,
                })
            }
        },
        [signTypedDataFn],
    )

    return useMemo(
        () => ({
            buildSmartWalletTransactionClauses,
        }),
        [buildSmartWalletTransactionClauses],
    )
}
