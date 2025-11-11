import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { Activity, ActivityType } from "~Model"
import { debug } from "~Utils"
import { AccountActivities, ActivityState } from "../Types"

const OldActivityType = {
    STARGATE_CLAIM_REWARDS_BASE: "STARGATE_CLAIM_REWARDS_BASE",
    STARGATE_CLAIM_REWARDS_DELEGATE: "STARGATE_CLAIM_REWARDS_DELEGATE",
    STARGATE_DELEGATE: "STARGATE_DELEGATE",
    STARGATE_UNDELEGATE: "STARGATE_UNDELEGATE",
}

const mapOldActivityTypeToNewActivityType = (activity: Activity) => {
    if (activity.type === OldActivityType.STARGATE_CLAIM_REWARDS_BASE) {
        activity.type = ActivityType.STARGATE_CLAIM_REWARDS_BASE_LEGACY
    }

    if (activity.type === OldActivityType.STARGATE_CLAIM_REWARDS_DELEGATE) {
        activity.type = ActivityType.STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY
    }

    if (activity.type === OldActivityType.STARGATE_DELEGATE) {
        activity.type = ActivityType.STARGATE_DELEGATE_LEGACY
    }

    if (activity.type === OldActivityType.STARGATE_UNDELEGATE) {
        activity.type = ActivityType.STARGATE_UNDELEGATE_LEGACY
    }
    return activity
}

export const Migration33 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState = state.activities

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
