import { AppThunk } from "~Storage/Caches/cache"
import {
    getAllNetworks,
    getCurrentNetwork,
} from "~Storage/Caches/SettingsCache"
import NetworkService from "../SettingService/Network"
import { SendTransactionPayload } from "~Common/models/ConnectedApps"
import { WalletAccount } from "~Model/Account"
import {
    ConnexTransactionData,
    CreateBodyParams,
    TransactionType,
    TransferData,
} from "~Model/Transaction"
import {
    getFungibleTokens,
    getFungibleTokensForAccount,
} from "~Storage/Caches/TokenCache"
import TransactionUtils from "~Common/Utils/TransactionUtils"
import SettingService from "../SettingService"
import ThorService from "../ThorService"
import { address, Transaction } from "thor-devkit"
import { veWorldErrors } from "~Common/Errors"
import {
    ActivityStatus,
    ConnectedAppTxActivity,
    FungibleTokenActivity,
} from "~Model/Activity"
import { ActivityType } from "~Model/Activity/enum"
import ActivityService from "../ActivityService"
import { VET } from "~Common/constants/Token/TokenConstants"
import { FungibleToken } from "~Model/Token"
import AddressUtils from "~Common/Utils/AddressUtils"
import HexUtils from "~Common/Utils/HexUtils"
import { DIRECTIONS } from "~Common/enums/enums"
import { debug, error, warn } from "~Common/Logger/Logger"
import DelegationService from "../DelegationService/DelegationService"

const getTransaction =
    (txId: string): AppThunk<Promise<Connex.Thor.Transaction | null>> =>
    async (_, getState) => {
        debug("Getting transaction")

        try {
            const network = getCurrentNetwork(getState())

            const thor = await NetworkService.getConnexThor(network)

            return thor.transaction(txId).get()
        } catch (e) {
            warn(e)
            return null
        }
    }

const getTransactionReceipt =
    (txId: string): AppThunk<Promise<Connex.Thor.Transaction.Receipt | null>> =>
    async (_, getState) => {
        debug("Getting transaction receipt")

        try {
            const network = getCurrentNetwork(getState())

            const thor = await NetworkService.getConnexThor(network)

            return thor.transaction(txId).getReceipt()
        } catch (e) {
            warn(e)
            return null
        }
    }

const buildTokenTransaction =
    (
        transferData: TransferData,
        account: WalletAccount,
    ): AppThunk<Promise<Transaction>> =>
    async (_, getState) => {
        debug("Building token transaction")

        try {
            const network = getCurrentNetwork(getState())
            const thorClient = await SettingService.Network.getConnexThor(
                network,
            )

            if (transferData.token.symbol === VET.symbol) {
                return ThorService.createTransferVetTransaction(
                    thorClient,
                    transferData.destinationAddress,
                    transferData.amountToTransfer,
                    account.address,
                )
            } else {
                return ThorService.createTransferFungibleTokenTransaction(
                    thorClient,
                    transferData.token.address,
                    transferData.destinationAddress,
                    transferData.amountToTransfer,
                    transferData.token.decimals,
                    account.address,
                )
            }
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                message: "Failed to build transaction",
            })
        }
    }

const sendTokenTransferTransaction =
    (
        signedTx: Transaction,
        account: WalletAccount,
    ): AppThunk<Promise<FungibleTokenActivity>> =>
    async (dispatch, getState) => {
        debug("Sending token transfer transaction")

        try {
            const networks = getAllNetworks(getState())
            const fungibleTokens = getFungibleTokensForAccount(account.address)(
                getState(),
            )
            const network = networks.find(
                nt =>
                    parseInt(nt.genesis.id.slice(-2), 16) ===
                    signedTx.body.chainTag,
            )
            if (!network) throw Error("Can't find network for transaction")

            const transactionId = await ThorService.sendSignedTransaction(
                signedTx,
                network,
            )

            let token: FungibleToken | undefined
            let toAddress: string | null
            let amount: string | number

            const clause = signedTx.body.clauses[0]
            if (clause.data === "0x") {
                token = { ...VET, genesisId: network.genesis.id, custom: false }
                toAddress = clause.to
                amount = clause.value
            } else {
                token = fungibleTokens.find(tkn =>
                    AddressUtils.compareAddresses(tkn.address, clause.to),
                )
                toAddress = address.toChecksumed(
                    HexUtils.addPrefix(clause.data.slice(34, 74)),
                )
                amount = HexUtils.addPrefix(
                    clause.data.slice(75).replace(/^0+/, ""),
                )
            }

            if (!token)
                throw veWorldErrors.rpc.internal({
                    message: "Can't find token",
                })

            const fromAddress = address.toChecksumed(
                signedTx.origin || account.address,
            )
            const activity: FungibleTokenActivity = {
                from: fromAddress,
                to: toAddress ? [toAddress] : [],
                id: transactionId,
                isTransaction: true,
                networkId: network.id,
                type: ActivityType.FUNGIBLE_TOKEN,
                amount: amount,
                token,
                status: ActivityStatus.PENDING,
                finality: false,
                direction: DIRECTIONS.UP,
            }

            await dispatch(ActivityService.add(activity))

            return activity
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                message: "Failed to send transaction",
                error: e,
            })
        }
    }

const getTransactionLinkUrl = (
    txId: string,
    options?: Connex.Driver.TxOptions,
) => {
    debug("Getting transaction link URL")

    if (options && options.link) {
        return options.link.replace("{txid}", txId)
    }
}

const sendConnectedAppTransaction =
    (
        signedTransaction: Transaction,
        transactionData: ConnexTransactionData,
        account: WalletAccount,
    ): AppThunk<Promise<Connex.Vendor.TxResponse>> =>
    async (dispatch, getState) => {
        debug("Sending connected app transaction")

        try {
            const currentNetwork = getCurrentNetwork(getState())

            const txId = await ThorService.sendSignedTransaction(
                signedTransaction,
                currentNetwork,
            )

            const toAddresses = transactionData.clauses
                .map(cl => {
                    return cl.to
                })
                .filter(cl => {
                    return cl !== null && cl !== undefined
                }) as string[]

            const activity: ConnectedAppTxActivity = {
                from: account.address,
                to: toAddresses,
                id: txId,
                isTransaction: true,
                networkId: currentNetwork.id,
                clauseMetadata: transactionData.clauses,
                type: ActivityType.CONNECTED_APP_TRANSACTION,
                status: ActivityStatus.PENDING,
                finality: false,
                delegated: !!transactionData.txOptions?.delegator,
                txMessage: transactionData.txMessage,
                txOptions: transactionData.txOptions,
                linkUrl: getTransactionLinkUrl(txId, transactionData.txOptions),
                sender: transactionData.sender,
            }

            await dispatch(ActivityService.add(activity))

            return {
                txid: txId,
                signer: account.address,
            }
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                message: "Failed to send transaction",
                error: e,
            })
        }
    }

const buildConnectedAppTransaction =
    (
        request: SendTransactionPayload,
        sender: string,
        account: WalletAccount,
    ): AppThunk<Promise<ConnexTransactionData>> =>
    async (_, getState) => {
        debug("Building connected app transaction")

        try {
            const tokens = getFungibleTokens(getState())

            const interpretedClauses = TransactionUtils.interpretClauses(
                request.txMessage,
                tokens,
            )

            const currentNetwork = getCurrentNetwork(getState())

            const thorClient = await SettingService.Network.getConnexThor(
                currentNetwork,
            )

            const txParams: CreateBodyParams = {
                thorClient,
                clauses: request.txMessage,
                gasPayer: request.opts?.delegator?.signer,
                caller: account.address,
                dependsOn: request.opts?.dependsOn,
                suggestedGas: request.opts?.gas,
                delegate: !!request.opts?.delegator?.url,
                type: TransactionType.DAPP_TRANSACTION,
            }

            const transactionData = await ThorService.createBody(txParams)

            const tx = new Transaction(transactionData.txBody)

            const res: ConnexTransactionData = {
                transaction: tx,
                isReverted: transactionData.isReverted,
                clauses: interpretedClauses,
                txMessage: request.txMessage,
                txOptions: request.opts,
                sender,
            }

            if (request.opts.delegator?.url) {
                res.delegationSignature = await DelegationService.delegate(
                    tx,
                    request.opts.delegator.url,
                    account.address,
                )
            }

            return res
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                message: "Failed to build transaction",
                error: e,
            })
        }
    }

export default {
    getTransaction,
    getTransactionReceipt,
    buildConnectedAppTransaction,
    sendConnectedAppTransaction,
    buildTokenTransaction,
    sendTokenTransferTransaction,
}
