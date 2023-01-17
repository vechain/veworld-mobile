import { Activity, ActivityStatus, ActivityStorageData } from "~Model/Activity"
import ActivityStore from "~Storage/Stores/ActivityStore"
import { updateActivities } from "~Storage/Caches/ActivityCache"
import { AppThunk } from "~Storage/Caches/cache"
import { veWorldErrors } from "~Common/Errors"
import TransactionService from "../TransactionService"
import { debug, error } from "~Common/Logger/Logger"

const update =
    (
        activityUpdate: (activities: ActivityStorageData) => void,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Updating activity")

        try {
            // Update & Get the result
            const upd = await ActivityStore.update([activityUpdate])
            //Update the cache
            dispatch(updateActivities(upd.activities))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to update activities",
            })
        }
    }

const reset = (): AppThunk<Promise<void>> => async dispatch => {
    try {
        debug("Resetting activities")

        await ActivityStore.insert({ activities: [] })
        dispatch(updateActivities([]))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to reset activities",
        })
    }
}

const initialiseCache = (): AppThunk<Promise<void>> => async dispatch => {
    try {
        debug("Initialising activities cache")

        const storage = await ActivityStore.get()
        dispatch(updateActivities(storage.activities))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to initialise activities cache",
        })
    }
}

const add =
    <T extends Activity>(activity: T): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Adding activity")

        try {
            if (activity.isTransaction) {
                const transaction = await dispatch(
                    TransactionService.getTransaction(activity.id),
                )
                activity.transaction = transaction
                activity.timestamp = !transaction
                    ? Date.now() / 1000
                    : transaction.meta.blockTimestamp
            }

            const activityUpdate = (storage: ActivityStorageData) =>
                storage.activities.unshift(activity)

            await dispatch(update(activityUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to add activity",
            })
        }
    }

const upsertTransaction =
    (tx: Connex.Thor.Transaction): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Upserting a transacion activity")

        try {
            const activityUpdate = (storage: ActivityStorageData) => {
                const existingActivity = storage.activities.find(
                    activity => activity.id === tx.id,
                )

                if (existingActivity) {
                    existingActivity.transaction = tx
                } else {
                    throw veWorldErrors.rpc.resourceNotFound({
                        message: "Activity not found",
                    })
                }
            }

            await dispatch(update(activityUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to add transaction",
            })
        }
    }

const upsertTxReceipt =
    (
        txReceipt: Connex.Thor.Transaction.Receipt,
        finality = false,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Upserting transaction receipt")

        try {
            const activityUpdate = (storage: ActivityStorageData) => {
                const existingActivity = storage.activities.find(
                    activity => activity.id === txReceipt.meta.txID,
                )

                if (existingActivity) {
                    existingActivity.finality = finality
                    existingActivity.txReceipt = txReceipt
                    existingActivity.status = txReceipt.reverted
                        ? ActivityStatus.REVERTED
                        : ActivityStatus.SUCCESS
                } else {
                    throw veWorldErrors.rpc.resourceNotFound({
                        message: "Activity not found",
                    })
                }
            }

            await dispatch(update(activityUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to add transaction receipt",
            })
        }
    }

/**
 * Gets the transaction and the transaction receipt from the chain stores them with the activities
 *
 * @returns the tx receipt if it exists. Otherwise null
 */
const upsertTransactionDetails =
    (txId: string): AppThunk<Promise<Connex.Thor.Transaction.Receipt | null>> =>
    async dispatch => {
        debug("Upserting transaction details")

        try {
            //Get the Transaction
            const transaction = await dispatch(
                TransactionService.getTransaction(txId),
            )

            //Persist it
            if (transaction) await dispatch(upsertTransaction(transaction))

            //Get the receipt
            const receipt = await dispatch(
                TransactionService.getTransactionReceipt(txId),
            )

            //Persist it
            if (receipt) await dispatch(upsertTxReceipt(receipt))

            return receipt
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                message: "Failed to upsert transaction details",
            })
        }
    }

/**
 * Gets the tx receipt from the chain and stores it in the activity with a 'finality' status
 * @param activity
 */
const finaliseActivity =
    (txId: string): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Finalising activity")

        try {
            const finalReceipt = await dispatch(
                TransactionService.getTransactionReceipt(txId),
            )
            if (finalReceipt) {
                await dispatch(upsertTxReceipt(finalReceipt, true))
            }
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                message: "Failed to finalise activities",
            })
        }
    }

const lock = () => ActivityStore.lock()

const unlock = (key: string) => ActivityStore.unlock(key)

export default {
    update,
    reset,
    initialiseCache,
    add,
    lock,
    unlock,
    upsertTransaction,
    upsertTxReceipt,
    upsertTransactionDetails,
    finaliseActivity,
}
