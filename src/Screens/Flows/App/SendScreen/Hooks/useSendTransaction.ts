import { useNavigation } from "@react-navigation/native"
import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { HDNode, Transaction, abi, secp256k1 } from "thor-devkit"
import {
    FormattingUtils,
    GasUtils,
    HexUtils,
    ThorConstants,
    VET,
    error,
    info,
} from "~Common"
import { showErrorToast, showSuccessToast, useThor } from "~Components"
import { EstimateGasResult, FungibleTokenWithBalance, Wallet } from "~Model"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { abis } from "~Common/Constant/Thor/ThorConstants"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { Linking } from "react-native"

export const useSendTransaction = ({
    amount,
    token,
    address,
}: {
    token: FungibleTokenWithBalance
    amount: string
    address: string
}) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const [gas, setGas] = useState<EstimateGasResult>()
    const account = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const thorClient = useThor()
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
    // TODO: understand if it is correct
    const clauses = useMemo(() => {
        const scaledAmount =
            "0x" +
            new BigNumber(
                FormattingUtils.scaleNumberUp(amount, token.decimals),
            ).toString(16)
        // if vet
        if (token.symbol === VET.symbol) {
            return [
                {
                    to: address,
                    value: scaledAmount,
                    data: "0x",
                },
            ]
        }
        // if fungible token
        const func = new abi.Function(abis.vip180.transfer)
        const data = func.encode(address, scaledAmount)
        return [
            {
                to: token.address,
                value: 0,
                data: data,
            },
        ]
    }, [address, amount, token.address, token.decimals, token.symbol])
    const transaction = useMemo((): Transaction.Body => {
        // TODO: move it somewhere else
        const DEFAULT_GAS_COEFFICIENT = 0
        return {
            chainTag: parseInt(thorClient.genesis.id.slice(-2), 16),
            blockRef: thorClient.status.head.id.slice(0, 18),
            expiration: 18,
            clauses,
            gasPriceCoef: DEFAULT_GAS_COEFFICIENT,
            gas: gas?.gas || "0",
            dependsOn: null, // TODO: in extension it is null
            nonce: HexUtils.generateRandom(8),
        }
    }, [clauses, thorClient.genesis.id, thorClient.status.head.id, gas?.gas])
    const signTransaction = async (wallet: Wallet) => {
        try {
            // TODO: Add delegation
            // const tx = delegation.isDelegated
            //     ? TransactionUtils.toDelegation(transaction.body)
            //     : new Transaction(transaction.body)
            const tx = new Transaction(transaction)

            if (!wallet.mnemonic)
                error("Mnemonic wallet can't have an empty mnemonic")

            if (!account?.index && account?.index !== 0)
                throw new Error("account index is empty")

            const hdNode = HDNode.fromMnemonic(wallet.mnemonic)
            const derivedNode = hdNode.derive(account.index)

            const privateKey = derivedNode.privateKey as Buffer
            const hash = tx.signingHash()

            const senderSignature = secp256k1.sign(hash, privateKey)

            // TODO: add delegation
            // const signature = delegationSignature
            //     ? Buffer.concat([senderSignature, delegationSignature])
            //     : senderSignature

            const signature = Buffer.concat([senderSignature])
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

            nav.navigate(Routes.HOME)
        } catch (e) {
            error(e)
            showErrorToast(LL.ERROR(), LL.ERROR_GENERIC_OPERATION())
        }

        // onSentTransaction(tx, id, currentAccount.address)
    }
    useEffect(() => {
        // eslint-disable-next-line no-extra-semi
        ;(async () => {
            const estimatedGas = await GasUtils.estimateGas(
                thorClient,
                clauses,
                0, // NOTE: suggestedGas: 0;  in extension it was fixed 0
                address,
                // NOTE: gasPayer: undefined; in extension it was not used
            )
            info("estimatedGas", estimatedGas)
            setGas(estimatedGas)
        })()
    }, [address, clauses, thorClient])

    return { gas, setGas, signTransaction }
}
