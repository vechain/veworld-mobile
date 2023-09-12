import { HDNode, secp256k1 } from "thor-devkit"
import { DEVICE_TYPE, Wallet } from "~Model"
import {
    selectDevice,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { WalletEncryptionKeyHelper } from "~Components"

type Props = {
    hash: Buffer
}

export const useSignMessage = ({ hash }: Props) => {
    const account = useAppSelector(selectSelectedAccount)
    const senderDevice = useAppSelector(state =>
        selectDevice(state, account.rootAddress),
    )

    const getSignature = async (wallet: Wallet) => {
        if (!wallet.mnemonic)
            throw new Error("Mnemonic wallet can't have an empty mnemonic")

        if (!account.index && account.index !== 0)
            throw new Error("signatureAccount index is empty")

        const hdNode = HDNode.fromMnemonic(wallet.mnemonic)
        const derivedNode = hdNode.derive(account.index)

        const privateKey = derivedNode.privateKey as Buffer
        return secp256k1.sign(hash, privateKey)
    }

    const signMessage = async (password?: string) => {
        if (!senderDevice) return

        if (senderDevice.type === DEVICE_TYPE.LEDGER)
            throw new Error("Ledger devices not supported in this hook")

        //local mnemonic, identity already verified via useCheckIdentity
        if (!senderDevice.wallet)
            throw new Error("The device doesn't have a wallet")

        const wallet: Wallet = await WalletEncryptionKeyHelper.decryptWallet(
            senderDevice.wallet,
            password,
        )

        return await getSignature(wallet)
    }

    return {
        signMessage,
    }
}
