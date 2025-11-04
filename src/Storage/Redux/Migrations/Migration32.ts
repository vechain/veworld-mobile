import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { DAppUtils, debug } from "~Utils"
import { DiscoveryState, DAppReference } from "../Slices"

export const Migration32 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 32: Converting favorites to favoriteRefs")

    // @ts-expect-error
    const currentDiscoveryState: DiscoveryState = state.discovery

    if (!currentDiscoveryState || Object.keys(currentDiscoveryState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No discovery state to migrate **** =================")
        return state
    }

    if (currentDiscoveryState.favoriteRefs && currentDiscoveryState.favoriteRefs.length > 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** favoriteRefs already exists **** =================")
        return state
    }

    const favoriteRefs: DAppReference[] = (currentDiscoveryState.favorites || [])
        .filter(dapp => !dapp.isCustom)
        .map((dapp, index) => {
            const ref: DAppReference = {
                id: dapp.id || dapp.veBetterDaoId || DAppUtils.generateDAppId(dapp.href),
                href: dapp.href,
                veBetterDaoId: dapp.veBetterDaoId,
                order: index,
            }

            if (dapp.isCustom) {
                ref.customMetadata = {
                    name: dapp.name,
                    iconUri: dapp.iconUri,
                    desc: dapp.desc,
                    isCustom: true as const,
                    createAt: dapp.createAt,
                }
            } else if (dapp.veBetterDaoId) {
                ref.fallbackMetadata = {
                    name: dapp.name,
                    desc: dapp.desc,
                    createAt: dapp.createAt,
                }
            }

            return ref
        })

    const newDiscoveryState = {
        ...currentDiscoveryState,
        favoriteRefs,
    } satisfies DiscoveryState

    debug(ERROR_EVENTS.SECURITY, `Migrated ${favoriteRefs.length} favorites to favoriteRefs`)

    return {
        ...state,
        discovery: newDiscoveryState,
    } as PersistedState
}
