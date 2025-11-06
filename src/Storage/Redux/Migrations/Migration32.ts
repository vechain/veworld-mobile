import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"

export const Migration32 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 32: Migrating notification registration state to new format")

    // @ts-ignore
    const currentState = state.notification

    // Remove old fields and initialize EntityAdapter structure nested under registrations
    const newNotificationState = {
        feautureEnabled: currentState?.feautureEnabled ?? false,
        permissionEnabled: currentState?.permissionEnabled ?? null,
        optedIn: currentState?.optedIn ?? null,
        dappVisitCounter: currentState?.dappVisitCounter ?? {},
        userTags: currentState?.userTags ?? {},
        dappNotifications: currentState?.dappNotifications ?? true,
        // EntityAdapter structure nested under registrations
        registrations: {
            ids: [],
            entities: {},
        },
    }

    return {
        ...state,
        notification: newNotificationState,
    } as PersistedState
}
