import axios from "axios"
import { HDNode, Transaction, secp256k1 } from "thor-devkit"
import { HexUtils, ThorConstants, TransactionUtils, error } from "~Common"
import { showErrorToast, showSuccessToast, useThor } from "~Components"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    updateAccountBalances,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { Linking } from "react-native"
import { Wallet } from "~Model"

interface Props {
    transaction: Transaction.Body
    onTXFinish: () => void
    isDelegated: boolean
    delegationSignature?: Buffer
}

export const useSignTransaction = ({
    transaction,
    onTXFinish,
    isDelegated,
    delegationSignature,
}: Props) => {
    const { LL } = useI18nContext()
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const dispatch = useAppDispatch()
    const thorClient = useThor()
    /**
     * send signed transaction with thorest apis
     */
    const sendSignedTransaction = async (
        tx: Transaction,
        networkUrl: string,
    ) => {
        const encodedRawTx = {
            raw: HexUtils.addPrefix(tx.encode().toString("hex")),
        }

        const response = await axios.post(
            `${networkUrl}/transactions`,
            encodedRawTx,
        )

        return response.data.id
    }
    /**
     * sign transaction with user's wallet
     */
    const signTransaction = async (wallet: Wallet) => {
        try {
            const tx = isDelegated
                ? TransactionUtils.toDelegation(transaction)
                : new Transaction(transaction)

            if (!wallet.mnemonic)
                error("Mnemonic wallet can't have an empty mnemonic")

            if (!account?.index && account?.index !== 0)
                throw new Error("account index is empty")

            const hdNode = HDNode.fromMnemonic(wallet.mnemonic)
            const derivedNode = hdNode.derive(account.index)

            const privateKey = derivedNode.privateKey as Buffer
            const hash = tx.signingHash()

            const senderSignature = secp256k1.sign(hash, privateKey)

            const signature =
                isDelegated && delegationSignature
                    ? Buffer.concat([senderSignature, delegationSignature])
                    : senderSignature

            tx.signature = signature

            const id = await sendSignedTransaction(tx, network.currentUrl)
            showSuccessToast(
                LL.SUCCESS_GENERIC(),
                LL.SUCCESS_GENERIC_OPERATION(),
                LL.SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
                () => {
                    Linking.openURL(
                        `${
                            network.explorerUrl ||
                            ThorConstants.defaultMainNetwork.explorerUrl
                        }/transactions/${id}`,
                    )
                },
            )
            dispatch(updateAccountBalances(thorClient, account.address))
        } catch (e) {
            error(e)
            showErrorToast(LL.ERROR(), LL.ERROR_GENERIC_OPERATION())
        }

        onTXFinish()
    }

    return { signTransaction }
}
