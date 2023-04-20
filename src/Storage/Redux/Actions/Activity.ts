import { Activity } from "~Model"
import { createAppAsyncThunk } from "../Types"
import { selectAllActivities } from "../Selectors"
import { insertActivity } from "../Slices"
import { warn } from "~Common"

/**
 * Validates an activity and adds it to the store: if the activity is a transaction, we fetch the transaction from the chain
 * @param activity - Activity to validate and add
 * @param thor - Connex.Thor instance
 */
export const validateAndAddActivity = createAppAsyncThunk(
    "activity/validateAndAddActivity",
    async (
        { activity, thor }: { activity: Activity; thor: Connex.Thor },
        { dispatch, getState },
    ) => {
        const activities = selectAllActivities(getState())

        const activityExists = activities.find(ac => activity.id === ac.id)

        if (activityExists) {
            warn("Activity already exists")
            return
        }

        // If the activity is a transaction, we need to fetch the transaction from the chain
        if (activity.isTransaction) {
            const transaction = await thor.transaction(activity.id).get()
            activity.transaction = transaction
            activity.timestamp = !transaction
                ? Date.now() / 1000
                : transaction.meta.blockTimestamp
        }

        dispatch(insertActivity(activity))
    },
)
