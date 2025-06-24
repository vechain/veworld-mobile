import { encodeFunctionData, bytesToHex } from "viem"
import { ABIContract, Address, Clause, TransactionClause } from "@vechain/sdk-core"
import { SimpleAccountABI, SimpleAccountFactoryABI } from "../../Components/Providers/SocialLoginProvider/abi"
import {
    ExecuteBatchWithAuthorizationSignData,
    ExecuteWithAuthorizationSignData,
} from "../../Components/Providers/SocialLoginProvider/Types"

export interface SmartAccountConfig {
    address: string
    version?: number
    isDeployed: boolean
    hasV1SmartAccount: boolean
    factoryAddress: string
}

export interface NetworkConfig {
    chainId: number
    chainTag: number
}

export type SigningFunction = (typedData: any) => Promise<string>

/**
 * Build the typed data structure for executeBatchWithAuthorization
 */
export function buildBatchAuthorizationTypedData({
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

    return {
        domain: {
            name: "Wallet",
            version: "1",
            chainId,
            verifyingContract,
        },
        types: {
            ExecuteBatchWithAuthorization: [
                { name: "to", type: "address[]" },
                { name: "value", type: "uint256[]" },
                { name: "data", type: "bytes[]" },
                { name: "validAfter", type: "uint256" },
                { name: "validBefore", type: "uint256" },
                { name: "nonce", type: "bytes32" },
            ],
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
        },
        primaryType: "ExecuteBatchWithAuthorization",
        message: {
            to: toArray,
            value: valueArray,
            data: dataArray,
            validAfter: 0,
            validBefore: Math.floor(Date.now() / 1000) + 300, // e.g. 5 minutes from now
            nonce: bytesToHex(crypto.getRandomValues(new Uint8Array(32))),
        },
    }
}

/**
 * Build the typed data structure for executeWithAuthorization
 */
export function buildSingleAuthorizationTypedData({
    clause,
    chainId,
    verifyingContract,
}: {
    clause: TransactionClause
    chainId: number
    verifyingContract: string
}): ExecuteWithAuthorizationSignData {
    return {
        domain: {
            name: "Wallet",
            version: "1",
            chainId: chainId as unknown as number, // convert chainId to a number
            verifyingContract: verifyingContract,
        },
        types: {
            ExecuteWithAuthorization: [
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "data", type: "bytes" },
                { name: "validAfter", type: "uint256" },
                { name: "validBefore", type: "uint256" },
            ],
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
        },
        primaryType: "ExecuteWithAuthorization",
        message: {
            validAfter: 0,
            validBefore: Math.floor(Date.now() / 1000) + 60, // 1 minute
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
 * Build transaction clauses for smart wallet execution
 * This function handles both v1 (individual signatures) and v3+ (batch signatures) smart accounts
 */
export async function buildSmartWalletTransactionClauses({
    txClauses,
    smartAccountConfig,
    networkConfig,
    signTypedData,
    selectedAccountAddress,
}: {
    txClauses: TransactionClause[]
    smartAccountConfig: SmartAccountConfig
    networkConfig: NetworkConfig
    signTypedData: SigningFunction
    selectedAccountAddress?: string
}): Promise<TransactionClause[]> {
    const clauses: TransactionClause[] = []
    const {
        address: smartAccountAddress,
        version: smartAccountVersion,
        isDeployed: smartAccountIsDeployed,
        hasV1SmartAccount,
        factoryAddress: smartAccountFactoryAddress,
    } = smartAccountConfig
    const { chainId } = networkConfig

    // If the smart account was never deployed or the version is >= 3 and we have multiple clauses, we can batch them
    if (!hasV1SmartAccount || (smartAccountVersion && smartAccountVersion >= 3)) {
        const typedData = buildBatchAuthorizationTypedData({
            clauses: txClauses,
            chainId,
            verifyingContract: smartAccountAddress,
        })

        const signature = await signTypedData(typedData)

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

        // Now the single batch execution call using custom authorization for better compatibility
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
                    typedData.message.nonce, // If your contract expects bytes32
                    signature as `0x${string}`,
                ],
            ),
        )
    } else {
        // Else, if it is a v1 smart account, we need to sign each clause individually
        const dataToSign: ExecuteWithAuthorizationSignData[] = txClauses.map(txData =>
            buildSingleAuthorizationTypedData({
                clause: txData,
                chainId,
                verifyingContract: smartAccountAddress,
            }),
        )

        // request signatures using the provided signing function
        const signatures: string[] = []
        for (let index = 0; index < dataToSign.length; index++) {
            const data = dataToSign[index]
            const txClause = txClauses[index]
            if (!txClause) {
                throw new Error(`Transaction clause at index ${index} is undefined`)
            }
            const signature = await signTypedData(data)
            signatures.push(signature)
        }

        // if the account smartAccountAddress has no code yet, it's not been deployed/created yet
        if (!smartAccountIsDeployed) {
            clauses.push(
                Clause.callFunction(
                    Address.of(smartAccountFactoryAddress),
                    ABIContract.ofAbi(SimpleAccountFactoryABI).getFunction("createAccount"),
                    [selectedAccountAddress ?? ""],
                ),
            )
        }

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
    }

    return clauses
}
