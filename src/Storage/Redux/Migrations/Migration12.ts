import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { Activity } from "~Model"
import { debug } from "~Utils"
import { ActivityState } from "../Types"

const filterLocalActivities = (activity: Activity, index: number, self: Activity[]) => {
    // Return true only for the first occurrence of an activity with this txId or id
    return index === self.findIndex(a => (a.txId ? a.txId === activity.txId : a.id === activity.id))
}

export const Migration12 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState = state.activities

    //We don't have any state, so return immediately
    if (currentState.activities.length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: ActivityState = {
        activities: currentState.activities
            .sort((a: Activity, b: Activity) => b.timestamp - a.timestamp)
            .filter(filterLocalActivities),
    }

    return {
        ...state,
        activities: newState,
    } as PersistedState
}
