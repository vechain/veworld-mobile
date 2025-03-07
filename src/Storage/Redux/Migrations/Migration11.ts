import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { Activity, ActivityType } from "~Model"
import { debug } from "~Utils"
import { AccountActivities, ActivityState } from "../Types"

const OldActivityType = {
    VET_TRANSFER: "VET_TRANSFER",
    FUNGIBLE_TOKEN: "FUNGIBLE_TOKEN",
    NFT_TRANSFER: "NFT_TRANSFER",
}

const mapOldActivityTypeToNewActivityType = (activity: Activity) => {
    if (activity.type === OldActivityType.VET_TRANSFER) {
        activity.type = ActivityType.TRANSFER_VET
    }

    if (activity.type === OldActivityType.FUNGIBLE_TOKEN) {
        activity.type = ActivityType.TRANSFER_FT
    }

    if (activity.type === OldActivityType.NFT_TRANSFER) {
        activity.type = ActivityType.TRANSFER_NFT
    }

    return activity
}

export const Migration11 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState = state.activities

    //We don't have any state, so return immediately
    if (
        Object.keys(currentState).length > 0 &&
        !!(currentState as ActivityState)?.activities &&
        Array.isArray((currentState as ActivityState)?.activities)
    ) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: ActivityState = {
        activities: [],
    }

    // if previous state is empty, just return the new state
    if (Object.keys(currentState).length === 0) {
        return {
            ...state,
            activities: newState,
        } as PersistedState
    }

    const oldState = currentState as Record<string, AccountActivities>
    const addresses = Object.keys(currentState)

    addresses.forEach(address => {
        const transactionActivitiesMainnet = oldState[address].transactionActivitiesMainnet
        transactionActivitiesMainnet.forEach(activity => {
            mapOldActivityTypeToNewActivityType(activity)
            newState.activities.push(activity)
        })

        const transactionActivitiesTestnet = oldState[address].transactionActivitiesTestnet
        transactionActivitiesTestnet.forEach(activity => {
            mapOldActivityTypeToNewActivityType(activity)
            newState.activities.push(activity)
        })

        const nonTransactionActivities = oldState[address].nonTransactionActivities
        nonTransactionActivities.forEach(activity => {
            mapOldActivityTypeToNewActivityType(activity)
            newState.activities.push(activity)
        })
    })

    return {
        ...state,
        activities: newState,
    } as PersistedState
}
