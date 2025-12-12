import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { DiscoveryState } from "../Slices"

export const Migration26 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 26: Removing preview field from tabs (migrating to previewPath)")

    // @ts-ignore
    const currentState: DiscoveryState = state.discovery

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    // Remove the preview field from all tabs
    const updatedTabs =
        currentState.tabsManager?.tabs?.map(tab => {
            //@ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { preview, ...tabWithoutPreview } = tab
            return tabWithoutPreview
        }) || []

    const newState: DiscoveryState = {
        ...currentState,
        tabsManager: {
            ...currentState.tabsManager,
            tabs: updatedTabs,
        },
    }

    return {
        ...state,
        discovery: newState,
    } as PersistedState
}
