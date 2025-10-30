import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"

interface OldNotificationState {
    feautureEnabled: boolean
    permissionEnabled: boolean | null
    optedIn: boolean | null
    dappVisitCounter: Record<string, number>
    userTags: Record<string, string>
    dappNotifications: boolean
    walletRegistrations: Record<string, number> | null
    lastFullRegistration: number | null
    lastSubscriptionId: string | null
}

export interface PendingWallet {
    address: string
    status: "REGISTER" | "UNREGISTER"
    attempts: number
    addedAt: number
}

interface NewNotificationState {
    feautureEnabled: boolean
    permissionEnabled: boolean | null
    optedIn: boolean | null
    dappVisitCounter: Record<string, number>
    userTags: Record<string, string>
    dappNotifications: boolean
    walletRegistrations: Record<string, number> | null
    lastFullRegistration: number | null
    lastSubscriptionId: string | null
    walletsPending: PendingWallet[]
}

export const Migration32 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.NOTIFICATION_CENTER, "Performing migration 32: Add walletsPending queue")

    // @ts-expect-error
    const currentNotificationState: OldNotificationState = state.notification

    if (!currentNotificationState || Object.keys(currentNotificationState).length === 0) {
        debug(ERROR_EVENTS.NOTIFICATION_CENTER, "================= **** No notification state to migrate **** =================")
        return state
    }

    // Simply add the new walletsPending field as an empty array
    const newNotificationState: NewNotificationState = {
        feautureEnabled: currentNotificationState.feautureEnabled,
        permissionEnabled: currentNotificationState.permissionEnabled,
        optedIn: currentNotificationState.optedIn,
        dappVisitCounter: currentNotificationState.dappVisitCounter,
        userTags: currentNotificationState.userTags,
        dappNotifications: currentNotificationState.dappNotifications,
        walletRegistrations: currentNotificationState.walletRegistrations,
        lastFullRegistration: currentNotificationState.lastFullRegistration,
        lastSubscriptionId: currentNotificationState.lastSubscriptionId,
        walletsPending: [], // Initialize as empty array
    }

    debug(ERROR_EVENTS.NOTIFICATION_CENTER, "Added walletsPending field to notification state")

    return {
        ...state,
        notification: newNotificationState,
    } as PersistedState
}
