import { abi, address, Transaction } from "thor-devkit"
import {
    abis,
    DEFAULT_GAS_COEFFICIENT,
} from "~Common/constants/Thor/ThorConstants"
import axios from "axios"
import TransactionUtils from "~Common/Utils/GasUtils"
import HexUtils from "~Common/Utils/HexUtils"
import { Network } from "~Model/Network"
import { veWorldErrors } from "~Common/Errors"
import { VET } from "~Common/constants/Token/TokenConstants"
import {
    CreateBodyParams,
    TransactionType,
    TransactionWithRevertData,
} from "~Model/Transaction"
import BigNumber from "bignumber.js"
import { scaleNumberUp } from "~Common/Utils/FormattingUtils/FormattingUtils"
import { warn } from "~Common/Logger/Logger"

const createTransferVetTransaction = async (
    thorClient: Connex.Thor,
    destination: string,
    amount: BigNumber.Value,
    caller: string,
    gasPayer?: string,
): Promise<Transaction> => {
    if (!address.test(destination))
        throw veWorldErrors.rpc.invalidInput({
            message: `Invalid destination address provided ${destination}`,
        })

    const clauses = [
        {
            to: destination,
            value: scaleNumberUp(amount, VET.decimals),
            data: "0x",
        },
    ]

    const transactionData = await createBody({
        thorClient,
        clauses,
        caller,
        gasPayer,
        type: TransactionType.TOKEN_TRANSFER,
    })

    return new Transaction(transactionData.txBody)
}

const createTransferFungibleTokenTransaction = async (
    thorClient: Connex.Thor,
    contractAddress: string,
    destination: string,
    amount: BigNumber.Value,
    decimals: number,
    caller: string,
    gasPayer?: string,
): Promise<Transaction> => {
    if (!address.test(destination))
        throw veWorldErrors.rpc.invalidInput({
            message: `Invalid destination address provided ${destination}`,
        })

    const func = new abi.Function(abis.vip180.transfer)

    const data = func.encode(destination, scaleNumberUp(amount, decimals))

    const clauses = [
        {
            to: contractAddress,
            value: 0,
            data: data,
        },
    ]

    const transactionData = await createBody({
        thorClient,
        clauses,
        caller,
        gasPayer,
        type: TransactionType.TOKEN_TRANSFER,
    })

    return new Transaction(transactionData.txBody)
}

const createBody = async (
    params: CreateBodyParams,
): Promise<TransactionWithRevertData> => {
    let isReverted = false

    // estimate gas
    const gas = await TransactionUtils.estimateGas(
        params.thorClient,
        params.clauses,
        params.suggestedGas || 0,
        params.caller,
        params.gasPayer,
    )

    if (gas.reverted) {
        warn(gas.revertReason)
        if (params.type === TransactionType.DAPP_TRANSACTION) isReverted = true
        else
            throw veWorldErrors.rpc.transactionRejected({
                message: gas.revertReason,
            })
    }

    const txBody: Transaction.Body = {
        chainTag: parseInt(params.thorClient.genesis.id.slice(-2), 16),
        blockRef: params.thorClient.status.head.id.slice(0, 18),
        expiration: 18,
        clauses: params.clauses.map(item => {
            return {
                to: item.to,
                value: "0x" + new BigNumber(item.value).toString(16),
                data: item.data || "0x",
            }
        }),
        gasPriceCoef: DEFAULT_GAS_COEFFICIENT,
        gas: gas.gas,
        dependsOn: params.dependsOn || null,
        nonce: HexUtils.generateRandom(8),
    }

    if (params.delegate)
        txBody.reserved = {
            features: 1, // this enables the fee delegation feature
        }

    return { txBody, isReverted }
}

const sendSignedTransaction = async (tx: Transaction, network: Network) => {
    const encodedRawTx = {
        raw: HexUtils.addPrefix(tx.encode().toString("hex")),
    }

    const response = await axios.post(
        `${network.url}/transactions`,
        encodedRawTx,
    )

    return response.data.id
}

export default {
    createBody,
    createTransferVetTransaction,
    createTransferFungibleTokenTransaction,
    sendSignedTransaction,
}
