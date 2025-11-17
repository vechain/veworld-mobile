import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { DAppUtils, debug } from "~Utils"
import { DiscoveryState, DAppReference } from "../Slices"

export const Migration33 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 33: Converting favorites to favoriteRefs")

    // @ts-expect-error
    const currentDiscoveryState: DiscoveryState = state.discovery

    if (!currentDiscoveryState || Object.keys(currentDiscoveryState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "No discovery state to migrate")
        return state
    }

    if (currentDiscoveryState.favoriteRefs && currentDiscoveryState.favoriteRefs.length > 0) {
        debug(ERROR_EVENTS.SECURITY, "favoriteRefs already exists, skipping migration")
        return state
    }

    // @ts-expect-error - favorites may exist in old persisted state but not in new type
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
        favoriteRefs,
    } satisfies DiscoveryState
    // Explicitly remove favorites to prevent it from persisting
    delete (newDiscoveryState as any).favorites
    debug(ERROR_EVENTS.SECURITY, `Migrated ${favoriteRefs.length} favorites to favoriteRefs and cleared old array`)

    return {
        ...state,
        discovery: newDiscoveryState,
    } as PersistedState
}
