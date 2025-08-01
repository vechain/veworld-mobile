import { Address, ABIContract, Clause, TransactionClause } from "@vechain/sdk-core"
import { encodeFunctionData, bytesToHex } from "viem"
import {
    SmartAccountTransactionConfig,
    ExecuteBatchWithAuthorizationSignData,
    ExecuteWithAuthorizationSignData,
    TransactionSigningFunction,
} from "../types/smartAccountTransaction"
import { SimpleAccountABI, SimpleAccountFactoryABI } from "../utils/abi"
import { BigNumberUtils } from "../../Utils"
import { abi } from "thor-devkit"

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
function createDomain(chainId: string, verifyingContract: string) {
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

/**
 * Build the typed data structure for executeBatchWithAuthorization
 */
function buildBatchAuthorizationTypedData({
    clauses,
    chainId,
    verifyingContract,
}: {
    clauses: TransactionClause[]
    chainId: string
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
            dataArray.push(clause.data ?? "0x")
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
    chainId: string
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
                    : clause.data) ?? "0x",
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
    ownerAddress,
}: {
    txClauses: TransactionClause[]
    smartAccountConfig: SmartAccountTransactionConfig
    chainId: string
    signTypedDataFn: TransactionSigningFunction
    ownerAddress: string
}): Promise<TransactionClause[]> {
    const { address, isDeployed, factoryAddress } = smartAccountConfig

    // Build the batch authorization typed data
    const typedData = buildBatchAuthorizationTypedData({
        clauses: txClauses,
        chainId,
        verifyingContract: address,
    })
    const signature = await signTypedDataFn(typedData)

    const clauses: TransactionClause[] = []
    // If the smart account is not deployed, deploy it first
    if (!isDeployed) {
        clauses.push(
            Clause.callFunction(
                Address.of(factoryAddress),
                ABIContract.ofAbi(SimpleAccountFactoryABI).getFunction("createAccount"),
                [ownerAddress],
            ),
        )
    }

    clauses.push(
        Clause.callFunction(
            Address.of(address),
            ABIContract.ofAbi(SimpleAccountABI).getFunction("executeBatchWithAuthorization"),
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
    ownerAddress,
}: {
    txClauses: TransactionClause[]
    smartAccountConfig: SmartAccountTransactionConfig
    chainId: string
    signTypedDataFn: TransactionSigningFunction
    ownerAddress: string
}): Promise<TransactionClause[]> {
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

    const clauses: TransactionClause[] = []
    // If the smart account is not deployed, deploy it first
    if (!isDeployed) {
        clauses.push(
            Clause.callFunction(
                Address.of(factoryAddress),
                ABIContract.ofAbi(SimpleAccountFactoryABI).getFunction("createAccount"),
                [ownerAddress],
            ),
        )
    }
    // Add individual execution calls
    dataToSign.forEach((data, index) => {
        const clause = Clause.callFunction(
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
        )
        clauses.push(clause)
    })
    return clauses
}

export async function buildSmartAccountTransaction(params: {
    txClauses: TransactionClause[]
    smartAccountConfig: SmartAccountTransactionConfig
    ownerAddress: string
    chainId: string
    signTypedDataFn: TransactionSigningFunction
    // optional gen delegator object
    genericDelgation?: {
        token: string
        tokenAddress: string
        isGenDelegation: boolean
        amount: BigNumberUtils | undefined
        delegatorAddress: string
    }
}): Promise<TransactionClause[]> {
    const { txClauses, smartAccountConfig, signTypedDataFn, chainId, genericDelgation, ownerAddress } = params
    const { hasV1Account } = smartAccountConfig

    const clauses: TransactionClause[] = [...txClauses]
    // Determine execution strategy based on smart account version
    const shouldUseBatchExecution = !hasV1Account

    if (genericDelgation && genericDelgation.isGenDelegation) {
        const transferClause = getTransferClause(
            genericDelgation.token,
            genericDelgation.tokenAddress,
            // TODO pass in proper one to these functions
            genericDelgation.delegatorAddress,
            genericDelgation.amount,
        )

        console.log("adding transfer clause for genericDelgation", JSON.stringify(transferClause))
        clauses.push(...transferClause)
    }

    if (shouldUseBatchExecution) {
        return await buildBatchExecutionClauses({
            txClauses: clauses,
            smartAccountConfig,
            chainId,
            signTypedDataFn,
            ownerAddress,
        })
    } else {
        console.log("building individual execution clauses")
        return await buildIndividualExecutionClauses({
            txClauses: clauses,
            smartAccountConfig,
            chainId,
            signTypedDataFn,
            ownerAddress,
        })
    }
}

export const transfer: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
        },
    ],
    name: "transfer",
    outputs: [
        {
            internalType: "bool",
            name: "",
            type: "bool",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

const getTransferClause = (
    token: string,
    tokenAddress: string,
    delegatorAddress: string,
    amount: BigNumberUtils | undefined,
) => {
    console.log("getTransferClause amount", amount)
    const amountHex = `0x${amount?.toHex}`

    // code from export const prepareFungibleClause = (
    const addressTo = delegatorAddress
    if (token === "VET") {
        return [
            {
                to: addressTo,
                value: amountHex,
                data: "0x",
            },
        ]
    }

    const func = new abi.Function(transfer)
    const data = func.encode(addressTo, amountHex)

    return [
        {
            to: tokenAddress,
            value: "0x0",
            data: data,
        },
    ]
}
