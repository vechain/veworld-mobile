import { Activity, ActivityStatus } from "~Model"
import { AppThunk, createAppAsyncThunk } from "~Storage/Redux/Types"
import {
    updateTransactionActivities,
    upsertActivity,
} from "~Storage/Redux/Slices"
import {
    selectCurrentTransactionActivities,
    selectSelectedAccount,
} from "~Storage/Redux/Selectors"
import { DEFAULT_PAGE_SIZE } from "./API"

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
            const tx = await thor.transaction(updatedActivity.id).get()
            updatedActivity.timestamp = !tx
                ? Date.now() / 1000
                : tx.meta.blockTimestamp

            const txReceipt = await thor
                .transaction(updatedActivity.id)
                .getReceipt()

            if (!txReceipt) updatedActivity.status = ActivityStatus.PENDING
            else
                updatedActivity.status = txReceipt.reverted
                    ? ActivityStatus.REVERTED
                    : ActivityStatus.SUCCESS
        }
        dispatch(
            upsertActivity({
                address: updatedActivity.from,
                activity: updatedActivity,
            }),
        )
        return updatedActivity
    },
)

/**
 * This method updates account transaction activities.
 * It fetches the current activities from the state, adds new activities,
 * sorts them based on timestamp, and limits them to DEFAULT_PAGE_SIZE.
 *
 * @param transactionActivities - The new transaction activities to be added.
 * @returns A ThunkAction, which dispatches the updateTransactionActivities action.
 */
export const updateAccountTransactionActivities =
    (transactionActivities: Activity[]): AppThunk<void> =>
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
            if (existingActivities.find(act => act.id === activity.id)) return

            newTransactionActivities.push(activity)
        })

        // Sort the activities and slice to the default page size
        newTransactionActivities.sort((a, b) => b.timestamp - a.timestamp)
        newTransactionActivities = newTransactionActivities.slice(
            0,
            DEFAULT_PAGE_SIZE,
        )

        dispatch(
            updateTransactionActivities({
                address: selectedAccount.address,
                activities: newTransactionActivities,
            }),
        )
    }
