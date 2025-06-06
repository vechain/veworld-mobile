import { useEmbeddedEthereumWallet } from "@privy-io/expo"
import { encodeFunctionData, bytesToHex } from "viem"
import { ABIContract, Address, Clause, Transaction } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { SimpleAccountABI, SimpleAccountFactoryABI } from "./abi"
import { ExecuteBatchWithAuthorizationSignData, ExecuteWithAuthorizationSignData } from "./Types"

import { getUrlDelegationSignature } from "../../../Utils/SignerUtil"
import { useSmartWalletDetails } from "./useSmartWalletDetails"
import { selectChainTag, selectSelectedNetwork, useAppSelector } from "../../../Storage/Redux"
import { selectSelectedAccount } from "~Storage/Redux"
import { HexUtils } from "~Utils"

export const useSmartWallet = ({ delegatorUrl }: { delegatorUrl: string }) => {
    const { wallets } = useEmbeddedEthereumWallet()
    console.log("Embedded account:", wallets[0])
    // const { connection, connectedWallet } = useWallet()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const chainTag = useAppSelector(selectChainTag)
    const thor = ThorClient.at(selectedNetwork.currentUrl)

    const { hasV1SmartAccountQuery, smartAccountVersionQuery, smartAccountQuery, getSmartAccountAddress } =
        useSmartWalletDetails(selectedAccount?.address ?? "")
    const hasV1SmartAccount = hasV1SmartAccountQuery.data
    console.log("hasV1SmartAccount:", hasV1SmartAccount)

    const smartAccountVersion = smartAccountVersionQuery.data
    console.log("smartAccountVersion:", smartAccountVersion)

    const smartAccountAddress = smartAccountQuery.data?.address
    console.log("smartAccountAddress:", smartAccountAddress)

    const smartAccountIsDeployed = smartAccountQuery.data?.isDeployed
    console.log("smartAccountIsDeployed:", smartAccountIsDeployed)

    const smartAccountFactoryAddress = getSmartAccountAddress(selectedNetwork.name).accountFactoryAddress
    console.log("smartAccountFactoryAddress:", smartAccountFactoryAddress)

    /**
     * Build the typed data structure for executeBatchWithAuthorization
     * @param clauses - The clauses to sign
     * @param chainId - The chain id
     * @param verifyingContract - The address of the smart account
     * @returns The typed data structure for executeBatchWithAuthorization
     */
    function buildBatchAuthorizationTypedData({
        clauses,
        chainId,
        verifyingContract,
    }: {
        clauses: Connex.VM.Clause[]
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
     * @param clause - The clause to sign
     * @param chainId - The chain id
     * @param verifyingContract - The address of the smart account
     * @returns The typed data structure for executeWithAuthorization
     */
    function buildSingleAuthorizationTypedData({
        clause,
        chainId,
        verifyingContract,
    }: {
        clause: Connex.VM.Clause
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
     * Sign typed data using the embedded wallet provider for React Native
     */
    const signTypedDataPrivy = async (typedData: any): Promise<string> => {
        if (!wallets.length) {
            throw new Error("No embedded wallet available")
        }

        const { domain, types, value } = typedData
        if (!wallets) throw new Error("No Social wallet found")

        const privyProvider = await wallets[0].getProvider()
        const privvyAccount = wallets[0].address

        const signature = await privyProvider.request({
            method: "eth_signTypedData_v4",
            params: [privvyAccount, { domain, primaryType: "Person", types, message: { ...value } }],
        })
        console.log("signed typed data with Privy", signature)
        return signature
    }

    /**
     * Sign a message using the embedded wallet provider for React Native
     */
    const signMessagePrivy = async (message: Buffer): Promise<Buffer> => {
        if (!wallets.length) {
            throw new Error("No embedded wallet available")
        }

        const privyProvider = await wallets[0].getProvider()
        const privvyAccount = wallets[0].address
        const signature = await privyProvider.request({
            method: "personal_sign",
            params: [HexUtils.addPrefix(message.toString("hex")), privvyAccount],
        })

        return signature
    }

    /**
     * Export wallet functionality for React Native
     */
    const exportWallet = async (): Promise<void> => {
        // In React Native, wallet export might work differently
        // This is a placeholder implementation
        throw new Error("Wallet export not implemented for React Native")
    }

    /**
     * Send a transaction on vechain by asking the privy wallet to sign a typed data content
     * that will allow us the execute the action with his smart account through the executeWithAuthorization
     * function of the smart account.
     *
     * This function will do 3 things:
     * 1) Ask signature to the owner of the smart account (distinguishing between if smart account is v1 or v3)
     * - With v1 we will ask 1 signature request for each clause
     * - With v3 we will ask 1 signature request for the batch execution of all clauses
     * 2) After getting the signatures we rebuild the clauses to be broadcasted to the network
     * - If the smart account is not deployed, we add a clause to deploy it
     * 3) We then estimate the gas fees for the transaction and build the transaction body
     * 4) We sign the transaction with a random transaction user and request the fee delegator to pay the gas fees in the process
     * 5) We broadcast the transaction to the network
     */
    const sendTransaction = async ({
        txClauses = [],
        title = "Sign Transaction",
        description,
        buttonText = "Sign",
        suggestedMaxGas,
    }: {
        txClauses: Connex.VM.Clause[]
        title?: string
        description?: string
        buttonText?: string
        suggestedMaxGas?: number
    }): Promise<string> => {
        // Check if queries are still loading
        if (hasV1SmartAccountQuery.isLoading || smartAccountQuery.isLoading || smartAccountVersionQuery.isLoading) {
            throw new Error("Smart wallet data is still loading")
        }

        if (!smartAccountAddress || !selectedAccount || !selectedAccount.address) {
            throw new Error("Address or embedded wallet is missing")
        }

        // Clauses for the transaction
        const clauses = []

        // If the smart account was never deployed or the version is >= 3 and we have multiple clauses, we can batch them
        if (!hasV1SmartAccount || (smartAccountVersion && smartAccountVersion >= 3)) {
            const typedData = buildBatchAuthorizationTypedData({
                clauses: txClauses,
                chainId: chainTag,
                verifyingContract: smartAccountAddress,
            })

            // Sign the typed data (either cross-app or traditional Privy)
            const signature = await signTypedDataPrivy(typedData)

            // If the smart account is not deployed, deploy it first
            if (!smartAccountIsDeployed) {
                clauses.push(
                    Clause.callFunction(
                        Address.of(smartAccountFactoryAddress),
                        ABIContract.ofAbi(SimpleAccountFactoryABI).getFunction("createAccount"),
                        [selectedAccount.address ?? ""],
                    ),
                )
            }

            // Now the single batch execution call
            clauses.push(
                Clause.callFunction(
                    Address.of(smartAccountAddress),
                    ABIContract.ofAbi(SimpleAccountABI).getFunction("executeBatchWithAuthorization"),
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
                    chainId: chainTag,
                    verifyingContract: smartAccountAddress,
                }),
            )

            // request signatures using privy
            const signatures: string[] = []
            for (let index = 0; index < dataToSign.length; index++) {
                const data = dataToSign[index]
                const txClause = txClauses[index]
                if (!txClause) {
                    throw new Error(`Transaction clause at index ${index} is undefined`)
                }

                const signature = await signTypedDataPrivy(data)
                signatures.push(signature)
            }

            // if the account smartAccountAddress has no code yet, it's not been deployed/created yet
            if (!smartAccountIsDeployed) {
                clauses.push(
                    Clause.callFunction(
                        Address.of(smartAccountFactoryAddress),
                        ABIContract.ofAbi(SimpleAccountFactoryABI).getFunction("createAccount"),
                        [selectedAccount.address ?? ""],
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

        // Now we can broadcast the transaction to the network by using our random transaction user
        if (!wallets) throw new Error("No Social wallet found")

        const privyProvider = await wallets[0].getProvider()
        const embeddedWalletAddress = wallets[0].address
        // estimate the gas fees for the transaction
        const gasResult = await thor.gas.estimateGas(clauses, embeddedWalletAddress, {
            gasPadding: 1,
        })

        const parsedGasLimit = Math.max(gasResult.totalGas, suggestedMaxGas ?? 0)

        // build the transaction in VeChain format, with delegation enabled
        const txBody = await thor.transactions.buildTransactionBody(clauses, parsedGasLimit, { isDelegated: true })

        const tx = Transaction.of(txBody)

        const hash = tx.getTransactionHash()

        // console.log("Privy hash", hash.toString())
        const response = await privyProvider.request({
            method: "secp256k1_sign",
            params: [hash.toString()],
        })
        // console.log("privy got send signature", response)
        // vAdjusted = vAdjusted - 27
        const signatureHex = response.slice(2) // Remove 0x prefix
        const r = signatureHex.slice(0, 64)
        const s = signatureHex.slice(64, 128)
        const v = signatureHex.slice(128, 130)

        // Convert v from Ethereum format (27/28) to raw ECDSA format (0/1)
        let vAdjusted = parseInt(v, 16)
        if (vAdjusted === 27 || vAdjusted === 28) {
            vAdjusted -= 27 // Convert from 27/28 to 0/1
        }

        // Reassemble with the correct v value
        const adjustedSignature = `${r}${s}${vAdjusted.toString(16).padStart(2, "0")}`
        const signatureBuffer = Buffer.from(adjustedSignature, "hex")
        // console.log("signed TX with Privy", signatureBuffer)

        // sign the transaction and request the fee delegator to pay the gas fees in the process

        // TODO use embedded wallet to sign raw hash
        // const providerWithDelegationEnabled = new VeChainProvider(thor, wallet, true)
        // const signer = await providerWithDelegationEnabled.getSigner(randomTransactionUser.address)
        // const txInput = signerUtils.transactionBodyToTransactionRequestInput(txBody, randomTransactionUser.address)

        const rawDelegateSigned = await getUrlDelegationSignature(tx, delegatorUrl, wallets[0].address)

        // publish the hexlified signed transaction directly on the node api
        const { id } = (await fetch(`${nodeUrl}/transactions`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                raw: Buffer.concat([signatureBuffer, rawDelegateSigned]),
            }),
        }).then(res => res.json())) as { id: string }

        return id
    }

    /**
     * Sign a message using the VechainKit wallet
     * @param message - The message to sign
     * @returns The signature of the message
     */
    const signMessage = async (message: Buffer): Promise<Buffer> => {
        return await signMessagePrivy(message)
    }

    /**
     * Sign a typed data using the VechainKit wallet
     * @param data - The typed data to sign
     * @returns The signature of the typed data
     */
    const signTypedData = async (data: any): Promise<string> => {
        return await signTypedDataPrivy(data)
    }

    return {
        sendTransaction,
        signMessage,
        signTypedData,
        exportWallet,
        smartAccountAddress,
    }
}
