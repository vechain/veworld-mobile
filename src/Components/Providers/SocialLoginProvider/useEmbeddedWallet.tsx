import { useCallback } from "react"
import { useEmbeddedEthereumWallet } from "@privy-io/expo"
import { Address, Transaction } from "@vechain/sdk-core"
import { HexUtils } from "~Utils"
import { TypedData } from "../../../Model"

interface UseEmbeddedWalletResult {
    signTransaction: (transaction: Transaction, delegateFor?: string) => Promise<Buffer>
    signMessage: (hash: Buffer) => Promise<Buffer>
    signTypedData: (typedData: TypedData) => Promise<string>
}

export const useEmbeddedWallet = (): UseEmbeddedWalletResult => {
    const { wallets } = useEmbeddedEthereumWallet()

    const signTransaction = useCallback(
        async (transaction: Transaction, delegateFor?: string): Promise<Buffer> => {
            const hash = transaction.getTransactionHash(delegateFor ? Address.of(delegateFor) : undefined)

            if (!wallets) throw new Error("No Social wallet found")

            const privyProvider = await wallets[0].getProvider()

            const response = await privyProvider.request({
                method: "secp256k1_sign",
                params: [hash.toString()],
            })

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

            return signatureBuffer
        },
        [wallets],
    )

    const signMessage = useCallback(
        async (hash: Buffer): Promise<Buffer> => {
            if (!wallets) throw new Error("No Social wallet found")

            const privyProvider = await wallets[0].getProvider()
            const privvyAccount = wallets[0].address

            const signature = await privyProvider.request({
                method: "personal_sign",
                params: [HexUtils.addPrefix(hash.toString("hex")), privvyAccount],
            })

            return signature
        },
        [wallets],
    )

    const signTypedData = useCallback(
        async (typedData: TypedData): Promise<string> => {
            const { domain, types, value } = typedData
            if (!wallets) throw new Error("No Social wallet found")

            const privyProvider = await wallets[0].getProvider()
            const privvyAccount = wallets[0].address

            // Deduce primary type (standard approach)
            const primaryType = Object.keys(types).find(key => key !== "EIP712Domain") || Object.keys(types)[0]

            if (!primaryType) {
                throw new Error("No primary type found in types definition")
            }

            // Build EIP-712 compliant structure
            const eip712Data = {
                domain,
                primaryType,
                types,
                message: value,
            }

            console.log(`Signing typed data with primary type: ${primaryType}`)
            console.log("EIP-712 structure:", JSON.stringify(eip712Data, null, 2))

            const signature = await privyProvider.request({
                method: "eth_signTypedData_v4",
                params: [privvyAccount, eip712Data],
            })

            return signature
        },
        [wallets],
    )

    return {
        signTransaction,
        signMessage,
        signTypedData,
    }
}
