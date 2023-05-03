import { Activity, ActivityStatus } from "~Model"
import { createAppAsyncThunk } from "../Types"
import { upsertActivity } from "../Slices"
import { TransactionUtils } from "~Common"

/**
 * Upsert an activity to the store fetching the transaction details from the chain
 * If the activity is not a transaction, it will just upsert the activity
 * @param activity - Activity to upsert
 * @param thor - Connex.Thor instance
 */
export const validateAndUpsertActivity = createAppAsyncThunk(
    "activity/upsertTransactionDetails",
    async (
        { activity, thor }: { activity: Activity; thor: Connex.Thor },
        { dispatch },
    ) => {
        // If the activity is a transaction, we need to fetch the transaction from the chain
        if (activity.isTransaction) {
            activity.transaction = await thor.transaction(activity.id).get()
            activity.timestamp = !activity.transaction
                ? Date.now() / 1000
                : activity.transaction.meta.blockTimestamp

            activity.txReceipt = await thor
                .transaction(activity.id)
                .getReceipt()
            if (!activity.txReceipt) activity.status = ActivityStatus.PENDING
            else
                activity.status = activity.txReceipt.reverted
                    ? ActivityStatus.REVERTED
                    : ActivityStatus.SUCCESS

            if (!activity.finality) {
                activity.finality =
                    await TransactionUtils.checkForTransactionFinality(
                        activity,
                        thor,
                    )
            }
        }
        dispatch(upsertActivity(activity))
        return activity
    },
)
