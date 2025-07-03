import { ethers } from "ethers"
import { HDNode } from "thor-devkit"
import { WalletEncryptionKeyHelper } from "~Components"
import { DEVICE_TYPE, TypedData, Wallet } from "~Model"
import { selectDevice, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { HexUtils } from "~Utils"
import { useSmartWallet } from "../../VechainWalletKit"

type Props = { typedData: TypedData }

export const useSignTypedMessage = ({ typedData }: Props) => {
    const account = useAppSelector(selectSelectedAccount)
    const senderDevice = useAppSelector(state => selectDevice(state, account.rootAddress))
    const { signTypedData: signTypedDataWithSmartWallet } = useSmartWallet()

    const getSignature = (privateKey: Buffer) => {
        const { domain, types, value } = typedData

        const ethersWallet = new ethers.Wallet(Buffer.from(privateKey).toString("hex"))
        return ethersWallet._signTypedData(domain, types, value)
    }

    const getSignatureByMnemonic = (wallet: Wallet) => {
        if (!wallet.mnemonic) throw new Error("Mnemonic wallet can't have an empty mnemonic")

        if (!account.index && account.index !== 0) throw new Error("signatureAccount index is empty")

        const hdNode = HDNode.fromMnemonic(wallet.mnemonic)
        const derivedNode = hdNode.derive(account.index)

        const privateKey = derivedNode.privateKey as Buffer

        return getSignature(privateKey)
    }

    const getSignatureByPrivateKey = (wallet: Wallet) => {
        if (!wallet.privateKey) throw new Error("Private key wallet can't have an empty private key")

        const privateKey = Buffer.from(HexUtils.removePrefix(wallet.privateKey), "hex")

        return getSignature(privateKey)
    }

    const signTypedData = async (password?: string) => {
        if (!senderDevice) return

        if (senderDevice.type === DEVICE_TYPE.LEDGER) throw new Error("Ledger devices not supported in this hook")

        if (senderDevice.type === DEVICE_TYPE.SMART_WALLET) {
            const { domain, types, value } = typedData
            return await signTypedDataWithSmartWallet({ domain, types, message: value })
        }

        if (!senderDevice.wallet) throw new Error("The device doesn't have a wallet")

        const wallet: Wallet = await WalletEncryptionKeyHelper.decryptWallet({
            encryptedWallet: senderDevice.wallet,
            pinCode: password,
        })

        if (wallet.mnemonic) return getSignatureByMnemonic(wallet)
        if (wallet.privateKey) return getSignatureByPrivateKey(wallet)

        throw new Error("Wallet doesn't have a mnemonic or a private key")
    }

    return { signTypedData }
}
