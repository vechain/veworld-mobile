import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { NotificationState } from "../Types"

export const Migration21 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 21: Adding dapps notifications state")

    // @ts-ignore
    const currentState: NotificationState = state.notification

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: NotificationState = {
        ...currentState,
        dappNotifications: true,
    }

    return {
        ...state,
        notification: newState,
    } as PersistedState
}
