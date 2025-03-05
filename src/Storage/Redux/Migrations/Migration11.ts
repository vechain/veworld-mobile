import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { Activity, ActivityType } from "~Model"
import { debug } from "~Utils"
import { ActivitiesSliceState } from "../Slices"

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
    const currentState: ActivitiesSliceState = state.activities

    //We don't have any state, so return immediately
    if (Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: ActivitiesSliceState = {}

    const addresses = Object.keys(currentState)

    addresses.forEach(address => {
        const transactionActivitiesMainnet = currentState[address].transactionActivitiesMainnet.map(
            mapOldActivityTypeToNewActivityType,
        )

        const transactionActivitiesTestnet = currentState[address].transactionActivitiesTestnet.map(
            mapOldActivityTypeToNewActivityType,
        )

        const nonTransactionActivities = currentState[address].nonTransactionActivities.map(
            mapOldActivityTypeToNewActivityType,
        )

        if (!newState[address]) {
            newState[address] = {
                transactionActivitiesMainnet,
                transactionActivitiesTestnet,
                nonTransactionActivities,
            }
        }
    })

    debug(ERROR_EVENTS.SECURITY, "=== ** Migrated State ** ===", newState.showJailbrokeWarning)

    return {
        ...state,
        activities: newState,
    } as PersistedState
}
