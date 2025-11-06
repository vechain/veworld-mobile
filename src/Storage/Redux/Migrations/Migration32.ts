import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { DAppUtils, debug } from "~Utils"
import { DiscoveryState, DAppReference } from "../Slices"
import { NotificationState } from "../Types"

export const Migration32 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 32: Converting favorites to favoriteRefs")
    debug(ERROR_EVENTS.SECURITY, "Performing migration 32: Migrating notification registration state to new format")

    // @ts-expect-error
    const currentDiscoveryState: DiscoveryState = state.discovery
    // @ts-expect-error
    const currentNotificationState: NotificationState = state.notification

    if (!currentDiscoveryState || Object.keys(currentDiscoveryState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No discovery state to migrate **** =================")
        return state
    }

    if (currentDiscoveryState.favoriteRefs && currentDiscoveryState.favoriteRefs.length > 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** favoriteRefs already exists **** =================")
        return state
    }

    const favoriteRefs: DAppReference[] = (currentDiscoveryState.favorites || []).map((dapp, index): DAppReference => {
        // Custom URL bookmark
        if (dapp.isCustom) {
            return {
                type: "custom",
                url: dapp.href,
                title: dapp.name,
                description: dapp.desc,
                iconUri: dapp.iconUri,
                createAt: dapp.createAt,
                order: index,
            }
        }

        // VeBetterDAO bookmark
        if (dapp.veBetterDaoId) {
            return {
                type: "vbd",
                vbdId: dapp.veBetterDaoId,
                order: index,
            }
        }

        // App Hub bookmark
        return {
            type: "app-hub",
            id: dapp.id || DAppUtils.generateDAppId(dapp.href),
            order: index,
        }
    })

    // Remove old fields and initialize EntityAdapter structure nested under registrations
    const newNotificationState = {
        feautureEnabled: currentNotificationState?.feautureEnabled ?? false,
        permissionEnabled: currentNotificationState?.permissionEnabled ?? null,
        optedIn: currentNotificationState?.optedIn ?? null,
        dappVisitCounter: currentNotificationState?.dappVisitCounter ?? {},
        userTags: currentNotificationState?.userTags ?? {},
        dappNotifications: currentNotificationState?.dappNotifications ?? true,
        registrations: currentNotificationState?.registrations ?? {
            ids: [],
            entities: {},
        },
    } satisfies NotificationState

    const newDiscoveryState = {
        ...currentDiscoveryState,
        favorites: [],
        favoriteRefs,
    } satisfies DiscoveryState

    debug(ERROR_EVENTS.SECURITY, `Migrated ${favoriteRefs.length} favorites to favoriteRefs and cleared old array`)

    return {
        ...state,
        discovery: newDiscoveryState,
        notification: newNotificationState,
    } as PersistedState
}
