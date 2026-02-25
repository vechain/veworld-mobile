import { Transaction } from "@vechain/sdk-core"
import { ThorClient, TransactionReceipt } from "@vechain/sdk-network"
import { ethers } from "ethers"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { AnalyticsEvent, createAnalyticsEvent, MixPanelTransfers, VTHO } from "~Constants"
import { i18nObject } from "~i18n"
import {
    Activity,
    ActivityStatus,
    ActivityType,
    DEVICE_TYPE,
    FungibleTokenActivity,
    LoginActivityValue,
    NonFungibleTokenActivity,
    TypedData,
} from "~Model"
import { NAVIGATION_REF, Routes } from "~Navigation"
import {
    createConnectedAppActivity,
    createLoginActivity,
    createPendingDappTransactionActivity,
    createPendingNFTTransferActivityFromTx,
    createPendingTransferActivityFromTx,
    createSignCertificateActivity,
    createSingTypedDataActivity,
    enrichActivityWithTrackingData,
} from "~Networking"
import { ReceiptProcessor } from "~Services/AbiService/ReceiptProcessor"
import { selectLanguage, selectNetworkVBDTokens, selectSelectedAccount, selectSelectedNetwork } from "../../Selectors"
import { addActivity } from "../../Slices"
import { AppThunk, createAppAsyncThunk } from "../../Types"
import { AddressUtils, BigNutils } from "~Utils"
import ObjectUtils from "~Utils/ObjectUtils"
import AnalyticsUtils from "~Utils/AnalyticsUtils"

type ActivityOptions = {
    appName?: string
    appUrl?: string
} & Pick<Activity, "medium" | "signature" | "context" | "subject">

const accumulateTransfers = (
    receipt: TransactionReceipt,
    { processor, b3trAddress }: { processor: ReceiptProcessor; b3trAddress: string },
) => {
    const flattenedOutputs = receipt.outputs.flat()

    const origin = receipt.meta.txOrigin!

    const processedOutputs = processor.analyzeReceipt(flattenedOutputs, origin)

    const accumulatedResults = processedOutputs
        .filter(
            evt =>
                evt.name === "Transfer(indexed address,indexed address,uint256)" ||
                evt.name === "VET_TRANSFER(address,address,uint256)",
        )
        .reduce(
            (acc, curr) => {
                switch (curr.name) {
                    case "VET_TRANSFER(address,address,uint256)":
                        if (AddressUtils.compareAddresses(curr.params.from, origin)) {
                            acc.VET_SENT = BigNutils(acc.VET_SENT).plus(curr.params.amount).toString
                            acc.VET_SENT_COUNT = BigNutils(acc.VET_SENT_COUNT).plus(1).toString
                            return acc
                        }
                        if (AddressUtils.compareAddresses(curr.params.to, origin)) {
                            acc.VET_RECEIVED = BigNutils(acc.VET_RECEIVED).plus(curr.params.amount).toString
                            acc.VET_RECEIVED_COUNT = BigNutils(acc.VET_RECEIVED_COUNT).plus(1).toString
                            return acc
                        }
                        return acc
                    case "Transfer(indexed address,indexed address,uint256)":
                        if (AddressUtils.compareAddresses(curr.address, VTHO.address)) {
                            if (AddressUtils.compareAddresses(curr.params.from, origin)) {
                                acc.VTHO_SENT = BigNutils(acc.VTHO_SENT).plus(curr.params.value).toString
                                acc.VTHO_SENT_COUNT = BigNutils(acc.VTHO_SENT_COUNT).plus(1).toString
                                return acc
                            }
                            if (AddressUtils.compareAddresses(curr.params.to, origin)) {
                                acc.VTHO_RECEIVED = BigNutils(acc.VTHO_RECEIVED).plus(curr.params.value).toString
                                acc.VTHO_RECEIVED_COUNT = BigNutils(acc.VTHO_RECEIVED_COUNT).plus(1).toString
                                return acc
                            }
                            return acc
                        }
                        if (AddressUtils.compareAddresses(curr.address, b3trAddress)) {
                            if (AddressUtils.compareAddresses(curr.params.from, origin)) {
                                acc.B3TR_SENT = BigNutils(acc.B3TR_SENT).plus(curr.params.value).toString
                                acc.B3TR_SENT_COUNT = BigNutils(acc.B3TR_SENT_COUNT).plus(1).toString
                                return acc
                            }
                            if (AddressUtils.compareAddresses(curr.params.to, origin)) {
                                acc.B3TR_RECEIVED = BigNutils(acc.B3TR_RECEIVED).plus(curr.params.value).toString
                                acc.B3TR_RECEIVED_COUNT = BigNutils(acc.B3TR_RECEIVED_COUNT).plus(1).toString
                                return acc
                            }
                            return acc
                        }
                }

                return acc
            },
            {
                VET_SENT: "0",
                VET_RECEIVED: "0",
                B3TR_SENT: "0",
                B3TR_RECEIVED: "0",
                VTHO_SENT: "0",
                VTHO_RECEIVED: "0",
                B3TR_RECEIVED_COUNT: "0",
                B3TR_SENT_COUNT: "0",
                VET_RECEIVED_COUNT: "0",
                VET_SENT_COUNT: "0",
                VTHO_RECEIVED_COUNT: "0",
                VTHO_SENT_COUNT: "0",
            } as Record<keyof MixPanelTransfers, string>,
        )

    return Object.fromEntries(
        Object.entries(accumulatedResults).map(([key, value]) => {
            if (key.endsWith("COUNT")) return [key, Number.parseInt(value, 10)]
            return [key, Number.parseFloat(ethers.utils.formatEther(value))]
        }),
    )
}

/**
 * This method upserts an activity to the store fetching the transaction details from the chain
 * If the activity is not a transaction, it will just upsert the activity.
 *
 * @param activity - The activity to be upserted.
 * @param thor - The Connex.Thor instance used for querying the chain.
 * @param processor - Receipt processor with only Generic and Native enabled
 * @returns A promise which resolves to the upserted activity.
 */
export const validateAndUpsertActivity = createAppAsyncThunk(
    "activity/upsertTransactionDetails",
    async (
        { activity, thor, processor }: { activity: Activity; thor: ThorClient; processor: ReceiptProcessor },
        { dispatch, getState },
    ) => {
        let updatedActivity = { ...activity }
        const locale = selectLanguage(getState())
        const LL = i18nObject(locale)
        const selectedNetwork = selectSelectedNetwork(getState())
        const { B3TR } = selectNetworkVBDTokens(getState())

        let txReceipt: TransactionReceipt | null = null

        // If the activity is a transaction, we need to fetch the transaction from the chain
        if (updatedActivity.isTransaction) {
            txReceipt = await thor.transactions.getTransactionReceipt(updatedActivity.txId?.toLowerCase() ?? "")

            updatedActivity.blockNumber = txReceipt?.meta.blockNumber ?? 0

            if (!txReceipt) updatedActivity.status = ActivityStatus.PENDING
            else {
                updatedActivity.timestamp = !txReceipt ? Date.now() : txReceipt.meta.blockTimestamp * 1000
                updatedActivity.status = txReceipt.reverted ? ActivityStatus.REVERTED : ActivityStatus.SUCCESS
            }
        }

        // If the activity has been pending for more than 2 minutes, mark it as failed
        if (Date.now() - updatedActivity.timestamp > 120000 && updatedActivity.status === ActivityStatus.PENDING)
            updatedActivity.status = ActivityStatus.REVERTED

        if (updatedActivity.status === ActivityStatus.PENDING) {
            dispatch(addActivity(updatedActivity))
            return updatedActivity
        }

        if (updatedActivity.subject && updatedActivity.isTransaction) {
            dispatch(
                AnalyticsUtils.trackEvent(
                    AnalyticsEvent.WALLET_OPERATION,
                    createAnalyticsEvent(
                        ObjectUtils.trimUndefined({
                            network: selectedNetwork.name,
                            medium: updatedActivity.medium,
                            signature: updatedActivity.signature,
                            subject: updatedActivity.subject,
                            context: updatedActivity.context,
                            smartWalletAddress: updatedActivity.smartWalletAddress,
                            failed: updatedActivity.status === ActivityStatus.REVERTED,
                            dappUrl: updatedActivity.dappUrlOrName,
                            transactionId: updatedActivity.txId?.toLowerCase(),
                            ...(txReceipt && {
                                ...accumulateTransfers(txReceipt, {
                                    processor,
                                    b3trAddress: B3TR.address,
                                }),
                                origin: txReceipt.meta.txOrigin!.toLowerCase(),
                            }),
                        }),
                    ),
                ),
            )
        }

        if (
            [ActivityType.TRANSFER_FT, ActivityType.TRANSFER_NFT, ActivityType.TRANSFER_VET].includes(
                updatedActivity.type as ActivityType,
            )
        ) {
            Feedback.show({
                message:
                    updatedActivity.status === ActivityStatus.REVERTED
                        ? LL.TRANSACTION_FAILED()
                        : LL.TRANSACTION_DONE(),
                severity: FeedbackSeverity.SUCCESS,
                type: FeedbackType.ALERT,
                id: updatedActivity.txId,
                onPress() {
                    NAVIGATION_REF.navigate(Routes.HISTORY_STACK, {
                        screen: Routes.ACTIVITY_DETAILS,
                        params: {
                            activity: updatedActivity,
                        },
                    })
                },
            })
        }

        dispatch(addActivity(updatedActivity))
        return updatedActivity
    },
)

/**
 * Adds a pending transfer activity to the Redux store.
 *
 * @param outgoingTx - The outgoing transaction.
 * @param thor - The Connex.Thor instance used for querying the chain.
 * @returns An asynchronous thunk action that, when dispatched, upserts a pending transfer activity to the Redux store.
 */
export const addPendingTransferTransactionActivity =
    (outgoingTx: Transaction, options: ActivityOptions): AppThunk<void> =>
    (dispatch, getState) => {
        const locale = selectLanguage(getState())
        const LL = i18nObject(locale)
        const selectedAccount = selectSelectedAccount(getState())

        const isSmartWallet = selectedAccount?.device?.type === DEVICE_TYPE.SMART_WALLET

        if (!selectedAccount || !outgoingTx.id) return

        const pendingActivity: FungibleTokenActivity = createPendingTransferActivityFromTx(outgoingTx)
        const enrichedActivity = enrichActivityWithTrackingData(pendingActivity, {
            ...options,
            smartWalletAddress: isSmartWallet ? selectedAccount.address : undefined,
        })
        dispatch(addActivity(enrichedActivity))

        Feedback.show({
            severity: FeedbackSeverity.LOADING,
            message: LL.TRANSACTION_IN_PROGRESS(),
            type: FeedbackType.ALERT,
            id: outgoingTx.id.toString(),
            onPress() {
                NAVIGATION_REF.navigate(Routes.HISTORY_STACK, {
                    screen: Routes.HISTORY,
                    params: {
                        screen: Routes.ACTIVITY_ALL,
                    },
                })
            },
        })
    }

/**
 * Adds a pending NFT (Non-Fungible Token) transfer activity to the Redux store.
 *
 * The function creates a new pending activity for a given NFT transaction and upserts it to the store.
 * It then dispatches it to the appropriate slice of the Redux store depending on whether the Thor instance is
 * associated with the mainnet or testnet.
 *
 * @param outgoingTx - The outgoing NFT transaction.
 * @param thor - The Connex.Thor instance used for querying the chain.
 * @returns An asynchronous thunk action that, when dispatched, upserts a pending NFT transfer activity to the Redux store.
 */
export const addPendingNFTtransferTransactionActivity =
    (outgoingTx: Transaction, options: ActivityOptions): AppThunk<void> =>
    (dispatch, getState) => {
        const locale = selectLanguage(getState())
        const LL = i18nObject(locale)
        const selectedAccount = selectSelectedAccount(getState())
        const isSmartWallet = selectedAccount?.device?.type === DEVICE_TYPE.SMART_WALLET

        if (!selectedAccount || !outgoingTx.id) return

        const pendingActivity: NonFungibleTokenActivity = createPendingNFTTransferActivityFromTx(outgoingTx)
        const enrichedActivity = enrichActivityWithTrackingData(pendingActivity, {
            ...options,
            smartWalletAddress: isSmartWallet ? selectedAccount.address : undefined,
        })
        dispatch(addActivity(enrichedActivity))

        Feedback.show({
            severity: FeedbackSeverity.LOADING,
            message: LL.TRANSACTION_IN_PROGRESS(),
            type: FeedbackType.ALERT,
            id: outgoingTx.id.toString(),
            onPress() {
                NAVIGATION_REF.navigate(Routes.HISTORY_STACK, {
                    screen: Routes.HISTORY,
                    params: {
                        screen: Routes.ACTIVITY_ALL,
                    },
                })
            },
        })
    }

/**
 * This method adds a new connected application activity to the Redux store.
 *
 * @param name - The name of the connected application (optional).
 * @param linkUrl - The URL of the connected application (optional).
 * @param description - The description of the connected application (optional).
 * @param methods - The methods used by the connected application (optional).
 *
 * @returns An asynchronous thunk action that, when dispatched, adds a new connected app activity to the Redux store.
 */
export const addConnectedAppActivity =
    (name?: string, linkUrl?: string, description?: string, methods?: string[]): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())
        const selectedNetwork = selectSelectedNetwork(getState())

        if (!selectedAccount) return

        const connectedAppActivity = createConnectedAppActivity(
            selectedNetwork,
            selectedAccount.address,
            name,
            linkUrl,
            description,
            methods,
        )

        dispatch(addActivity(connectedAppActivity))
    }

/**
 * This method adds a new sign certificate activity to the Redux store.
 *
 * @param name - The name of the certificate (optional).
 * @param linkUrl - The URL of the certificate (optional).
 * @param content - The content of the certificate (optional).
 * @param purpose - The purpose of the certificate (optional).
 *
 * @returns An asynchronous thunk action that, when dispatched, adds a new sign certificate activity to the Redux store.
 */
export const addSignCertificateActivity =
    (name?: string, linkUrl?: string, content?: string, purpose?: string): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())
        const selectedNetwork = selectSelectedNetwork(getState())

        if (!selectedAccount) return

        const signedCertificateActivity = createSignCertificateActivity(
            selectedNetwork,
            selectedAccount.address,
            name,
            linkUrl,
            content,
            purpose,
        )

        dispatch(addActivity(signedCertificateActivity))
    }

export const addSignTypedDataActivity =
    (sender: string, typedData: TypedData): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())
        const selectedNetwork = selectSelectedNetwork(getState())

        if (!selectedAccount) return

        const typedDataActivity = createSingTypedDataActivity(selectedNetwork, typedData.signer, sender, typedData)
        dispatch(addActivity(typedDataActivity))
    }

export const addLoginActivity =
    ({ appUrl, ...rest }: { appUrl: string } & LoginActivityValue): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())
        const selectedNetwork = selectSelectedNetwork(getState())

        if (!selectedAccount) return

        const activity = createLoginActivity({
            url: appUrl,
            network: selectedNetwork,
            signer: selectedAccount.address,
            ...rest,
        })

        dispatch(addActivity(activity))
    }

/**
 * This method adds a new pending DApp transaction activity to the Redux store.
 *
 * @param tx - The transaction details.
 *
 * @returns An asynchronous thunk action that, when dispatched, adds a new pending DApp transaction activity to the Redux store.
 */
export const addPendingDappTransactionActivity =
    (tx: Transaction, options: ActivityOptions): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())

        const isSmartWallet = selectedAccount?.device?.type === DEVICE_TYPE.SMART_WALLET

        if (!selectedAccount) return

        const pendingDappActivity: Activity = createPendingDappTransactionActivity(tx, options.appName, options.appUrl)
        const enrichedActivity = enrichActivityWithTrackingData(pendingDappActivity, {
            ...options,
            smartWalletAddress: isSmartWallet ? selectedAccount.address : undefined,
        })
        dispatch(addActivity(enrichedActivity))
    }
