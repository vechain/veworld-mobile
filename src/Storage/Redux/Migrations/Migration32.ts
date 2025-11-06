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

    // --- Part 1: Migrate notification state (always run if needed) ---
    const needsNotificationMigration =
        !currentNotificationState?.registrations ||
        !currentNotificationState.registrations.ids ||
        !currentNotificationState.registrations.entities

    const newNotificationState: NotificationState = needsNotificationMigration
        ? {
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
        : currentNotificationState

    if (needsNotificationMigration) {
        debug(ERROR_EVENTS.SECURITY, "Migrated notification state to include registrations EntityAdapter structure")
    }

    // --- Part 2: Migrate discovery state (skip if already done) ---
    if (!currentDiscoveryState || Object.keys(currentDiscoveryState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No discovery state to migrate **** =================")
        return {
            ...state,
            notification: newNotificationState,
        } as PersistedState
    }

    if (currentDiscoveryState.favoriteRefs && currentDiscoveryState.favoriteRefs.length > 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** favoriteRefs already exists **** =================")
        return {
            ...state,
            notification: newNotificationState,
        } as PersistedState
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
