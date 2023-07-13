import {
    Activity,
    ActivityStatus,
    FungibleTokenActivity,
    NonFungibleTokenActivity,
} from "~Model"
import { AppThunk, createAppAsyncThunk } from "~Storage/Redux/Types"
import {
    updateTransactionActivitiesMainnet,
    updateTransactionActivitiesTestnet,
    upsertActivityMainnet,
    upsertActivityTestnet,
} from "~Storage/Redux/Slices"
import {
    selectCurrentTransactionActivities,
    selectSelectedAccount,
} from "~Storage/Redux/Selectors"
import {
    createIncomingTransfer,
    createPendingNFTTransferActivityFromTx,
    createPendingTransferActivityFromTx,
} from "./API"
import { Transaction } from "thor-devkit"
import { genesisesId } from "~Constants"
import { DEFAULT_PAGE_SIZE } from "~Networking"

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
    async (
        { activity, thor }: { activity: Activity; thor: Connex.Thor },
        { dispatch },
    ) => {
        let updatedActivity = { ...activity }

        // If the activity is a transaction, we need to fetch the transaction from the chain
        if (updatedActivity.isTransaction) {
            const txReceipt = await thor
                .transaction(updatedActivity.id)
                .getReceipt()

            updatedActivity.blockNumber = txReceipt?.meta.blockNumber ?? 0

            if (!txReceipt) updatedActivity.status = ActivityStatus.PENDING
            else {
                updatedActivity.timestamp = !txReceipt
                    ? Date.now()
                    : txReceipt.meta.blockTimestamp * 1000

                updatedActivity.status = txReceipt.reverted
                    ? ActivityStatus.REVERTED
                    : ActivityStatus.SUCCESS
            }
        }

        thor.genesis.id === genesisesId.main
            ? dispatch(
                  upsertActivityMainnet({
                      address: updatedActivity.from.toLowerCase(),
                      activity: updatedActivity,
                  }),
              )
            : dispatch(
                  upsertActivityTestnet({
                      address: updatedActivity.from.toLowerCase(),
                      activity: updatedActivity,
                  }),
              )

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
    (outgoingTx: Transaction, thor: Connex.Thor): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())

        // Ensure selectedAccount is not undefined and outgoingTx has a transaction ID
        if (!selectedAccount || !outgoingTx.id) return

        const pendingActivity: FungibleTokenActivity =
            createPendingTransferActivityFromTx(outgoingTx)

        thor.genesis.id === genesisesId.main
            ? dispatch(
                  upsertActivityMainnet({
                      address: selectedAccount.address.toLowerCase(),
                      activity: pendingActivity,
                  }),
              )
            : dispatch(
                  upsertActivityTestnet({
                      address: selectedAccount.address.toLowerCase(),
                      activity: pendingActivity,
                  }),
              )
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
    (outgoingTx: Transaction, thor: Connex.Thor): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())

        // Ensure selectedAccount is not undefined and outgoingTx has a transaction ID
        if (!selectedAccount || !outgoingTx.id) return

        const pendingActivity: NonFungibleTokenActivity =
            createPendingNFTTransferActivityFromTx(outgoingTx)

        thor.genesis.id === genesisesId.main
            ? dispatch(
                  upsertActivityMainnet({
                      address: selectedAccount.address.toLowerCase(),
                      activity: pendingActivity,
                  }),
              )
            : dispatch(
                  upsertActivityTestnet({
                      address: selectedAccount.address.toLowerCase(),
                      activity: pendingActivity,
                  }),
              )
    }

/**
 * Adds an incoming transfer activity to the Redux store.
 *
 * @param meta - Metadata about the transaction, which includes the transaction ID, block number, and block timestamp.
 * @param amount - The amount of tokens involved in the transaction.
 * @param recipient - The address of the recipient of the tokens.
 * @param sender - The address of the sender of the tokens.
 * @param tokenAddress - The address of the token contract.
 * @param thor - The Connex.Thor instance used for querying the chain.
 *
 * @returns An asynchronous thunk action that, when dispatched, upserts an incoming transfer activity to the Redux store.
 */
export const addIncomingTransfer =
    (
        meta: Connex.Thor.Filter.WithMeta["meta"],
        amount: string,
        recipient: string,
        sender: string,
        tokenAddress: string,
        thor: Connex.Thor,
    ): AppThunk<void> =>
    dispatch => {
        const incomingTransferActivity = createIncomingTransfer(
            meta,
            amount,
            recipient,
            sender,
            tokenAddress,
            thor,
        )

        thor.genesis.id === genesisesId.main
            ? dispatch(
                  upsertActivityMainnet({
                      address: recipient.toLowerCase(),
                      activity: incomingTransferActivity,
                  }),
              )
            : dispatch(
                  upsertActivityTestnet({
                      address: recipient.toLowerCase(),
                      activity: incomingTransferActivity,
                  }),
              )
    }

/**
 * This method updates account transaction activities.
 * It fetches the current activities from the state, adds new activities,
 * sorts them based on timestamp, and limits them to DEFAULT_PAGE_SIZE.
 *
 * @param transactionActivities - The new transaction activities to be added.
 * @returns A ThunkAction, which dispatches the updateTransactionActivities action.
 */
export const updateAccountTransactionActivities =
    (transactionActivities: Activity[], thor: Connex.Thor): AppThunk<void> =>
    async (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())

        // Ensure selectedAccount is not undefined
        if (!selectedAccount) return

        // Existing transaction activities for the account
        const existingActivities = selectCurrentTransactionActivities(
            getState(),
        )

        let newTransactionActivities = existingActivities

        transactionActivities.forEach(activity => {
            const existingActivityIndex = newTransactionActivities.findIndex(
                act => act.id.toLowerCase() === activity.id.toLowerCase(),
            )

            if (existingActivityIndex !== -1)
                newTransactionActivities[existingActivityIndex] = activity
            else newTransactionActivities.push(activity)
        })

        // Sort the activities and slice to the default page size
        newTransactionActivities.sort((a, b) => b.timestamp - a.timestamp)
        newTransactionActivities = newTransactionActivities.slice(
            0,
            DEFAULT_PAGE_SIZE * 2,
        )

        thor.genesis.id === genesisesId.main
            ? dispatch(
                  updateTransactionActivitiesMainnet({
                      address: selectedAccount.address.toLowerCase(),
                      activities: newTransactionActivities,
                  }),
              )
            : dispatch(
                  updateTransactionActivitiesTestnet({
                      address: selectedAccount.address.toLowerCase(),
                      activities: newTransactionActivities,
                  }),
              )
    }
