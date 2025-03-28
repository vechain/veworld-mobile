import { Transaction } from "thor-devkit"
import { Activity, ActivityStatus, FungibleTokenActivity, NonFungibleTokenActivity, TypedData } from "~Model"
import {
    createConnectedAppActivity,
    createPendingDappTransactionActivity,
    createPendingNFTTransferActivityFromTx,
    createPendingTransferActivityFromTx,
    createSignCertificateActivity,
    createSingTypedDataActivity,
} from "~Networking"
import { selectSelectedAccount, selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { addActivity } from "~Storage/Redux/Slices"
import { AppThunk, createAppAsyncThunk } from "~Storage/Redux/Types"

/**
 * This method upserts an activity to the store fetching the transaction details from the chain
 * If the activity is not a transaction, it will just upsert the activity.
 *
 * @param activity - The activity to be upserted.
 * @param thor - The Connex.Thor instance used for querying the chain.
 * @returns A promise which resolves to the upserted activity.
 */
export const validateAndUpsertActivity = createAppAsyncThunk(
    "activity/upsertTransactionDetails",
    async ({ activity, thor }: { activity: Activity; thor: Connex.Thor }, { dispatch }) => {
        let updatedActivity = { ...activity }

        // If the activity is a transaction, we need to fetch the transaction from the chain
        if (updatedActivity.isTransaction) {
            const txReceipt = await thor.transaction(updatedActivity.txId?.toLowerCase() ?? "").getReceipt()

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
    (outgoingTx: Transaction): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())

        if (!selectedAccount || !outgoingTx.id) return

        const pendingActivity: FungibleTokenActivity = createPendingTransferActivityFromTx(outgoingTx)
        dispatch(addActivity(pendingActivity))
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
    (outgoingTx: Transaction): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())
        if (!selectedAccount || !outgoingTx.id) return

        const pendingActivity: NonFungibleTokenActivity = createPendingNFTTransferActivityFromTx(outgoingTx)
        dispatch(addActivity(pendingActivity))
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

/**
 * This method adds a new pending DApp transaction activity to the Redux store.
 *
 * @param tx - The transaction details.
 * @param name - The name of the DApp (optional).
 * @param linkUrl - The URL of the DApp (optional).
 *
 * @returns An asynchronous thunk action that, when dispatched, adds a new pending DApp transaction activity to the Redux store.
 */
export const addPendingDappTransactionActivity =
    (tx: Transaction, name?: string, linkUrl?: string): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())

        if (!selectedAccount) return

        const pendingDappActivity: Activity = createPendingDappTransactionActivity(tx, name, linkUrl)
        dispatch(addActivity(pendingDappActivity))
    }
