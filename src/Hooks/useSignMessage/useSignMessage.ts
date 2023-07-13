import { HDNode, secp256k1 } from "thor-devkit"
import { showWarningToast } from "~Components"
import { DEVICE_TYPE, Wallet } from "~Model"
import {
    selectDevice,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { CryptoUtils } from "~Utils"

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

        // TODO (Erik) (https://github.com/vechainfoundation/veworld-mobile/issues/753) support ledger
        if (senderDevice.type === DEVICE_TYPE.LEDGER) {
            showWarningToast("Hardware wallet not supported yet")
            throw new Error("Hardware wallet not supported yet")
        }

        //local mnemonic, identity already verified via useCheckIdentity
        if (!senderDevice.wallet) {
            // TODO (Erik) (https://github.com/vechainfoundation/veworld-mobile/issues/753) support ledger
            showWarningToast("Hardware wallet not supported yet")
            throw new Error("Hardware wallet not supported yet")
        }

        const { decryptedWallet: senderWallet } =
            await CryptoUtils.decryptWallet(senderDevice, password)

        return await getSignature(senderWallet)
    }

    return {
        signMessage,
    }
}
