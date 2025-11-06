import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { NotificationState } from "../Types"

export const Migration33 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 33: Ensuring notification registrations structure exists")

    // @ts-expect-error
    const currentNotificationState: NotificationState = state.notification

    // Check if notification state needs fixing
    const needsNotificationFix =
        !currentNotificationState?.registrations ||
        !currentNotificationState.registrations.ids ||
        !currentNotificationState.registrations.entities

    if (!needsNotificationFix) {
        debug(ERROR_EVENTS.SECURITY, "Notification registrations structure already exists, skipping migration")
        return state
    }

    // Initialize the missing registrations EntityAdapter structure
    const fixedNotificationState: NotificationState = {
        feautureEnabled: currentNotificationState?.feautureEnabled ?? false,
        permissionEnabled: currentNotificationState?.permissionEnabled ?? null,
        optedIn: currentNotificationState?.optedIn ?? null,
        dappVisitCounter: currentNotificationState?.dappVisitCounter ?? {},
        userTags: currentNotificationState?.userTags ?? {},
        dappNotifications: currentNotificationState?.dappNotifications ?? true,
        registrations: {
            ids: [],
            entities: {},
        },
    }

    debug(ERROR_EVENTS.SECURITY, "Fixed missing notification registrations structure")

    return {
        ...state,
        notification: fixedNotificationState,
    } as PersistedState
}
