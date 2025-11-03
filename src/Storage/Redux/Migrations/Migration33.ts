import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { Registration, RegistrationState } from "../Types"

interface OldPendingWallet {
    address: string
    status: "REGISTER" | "UNREGISTER"
    attempts: number
    addedAt: number
}

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
    walletsPending: OldPendingWallet[]
}

interface NewNotificationState {
    feautureEnabled: boolean
    permissionEnabled: boolean | null
    optedIn: boolean | null
    dappVisitCounter: Record<string, number>
    userTags: Record<string, string>
    dappNotifications: boolean
    registrations: Registration[]
    lastSubscriptionId: string | null
}

export const Migration33 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.NOTIFICATION_CENTER, "Performing migration 33: Convert to new registration state machine")

    // @ts-expect-error
    const currentNotificationState: OldNotificationState = state.notification

    if (!currentNotificationState || Object.keys(currentNotificationState).length === 0) {
        debug(ERROR_EVENTS.NOTIFICATION_CENTER, "================= **** No notification state to migrate **** =================")
        return state
    }

    // Convert old state to new registrations array
    // We start fresh - all existing registrations will be re-evaluated on next app start
    const registrations: Registration[] = []

    // Convert successfully registered wallets to ACTIVE state
    if (currentNotificationState.walletRegistrations) {
        for (const [address, timestamp] of Object.entries(currentNotificationState.walletRegistrations)) {
            registrations.push({
                address,
                state: RegistrationState.ACTIVE,
                stateTransitionedTime: timestamp,
                lastSuccessfulSync: timestamp,
                consecutiveFailures: 0,
            })
        }
    }

    // Convert pending wallets to appropriate states
    if (currentNotificationState.walletsPending) {
        for (const pending of currentNotificationState.walletsPending) {
            // Check if this address is already in registrations (from walletRegistrations)
            const existingIndex = registrations.findIndex(r => r.address === pending.address)

            if (existingIndex >= 0) {
                // Address exists - update its state based on pending status
                if (pending.status === "UNREGISTER") {
                    registrations[existingIndex] = {
                        ...registrations[existingIndex],
                        state: RegistrationState.PENDING_UNREGISTER,
                        stateTransitionedTime: pending.addedAt,
                        consecutiveFailures: 0, // Reset failures on migration
                    }
                }
                // If status is REGISTER, keep as ACTIVE (it was already registered)
            } else {
                // New address - add as pending
                const state =
                    pending.status === "REGISTER" ? RegistrationState.PENDING : RegistrationState.PENDING_UNREGISTER
                registrations.push({
                    address: pending.address,
                    state,
                    stateTransitionedTime: pending.addedAt,
                    consecutiveFailures: 0, // Reset failures on migration
                })
            }
        }
    }

    const newNotificationState: NewNotificationState = {
        feautureEnabled: currentNotificationState.feautureEnabled,
        permissionEnabled: currentNotificationState.permissionEnabled,
        optedIn: currentNotificationState.optedIn,
        dappVisitCounter: currentNotificationState.dappVisitCounter,
        userTags: currentNotificationState.userTags,
        dappNotifications: currentNotificationState.dappNotifications,
        registrations,
        lastSubscriptionId: currentNotificationState.lastSubscriptionId,
    }

    debug(
        ERROR_EVENTS.NOTIFICATION_CENTER,
        `Migrated ${registrations.length} registrations to new state machine format`,
    )

    return {
        ...state,
        notification: newNotificationState,
    } as PersistedState
}
