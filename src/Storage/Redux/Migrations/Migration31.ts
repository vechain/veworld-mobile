import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { AccountSliceState, DiscoveryState } from "../Slices"

export const Migration31 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 31: Fixing URIs")

    // @ts-expect-error
    const currentAccountState: AccountSliceState = state.accounts
    // @ts-expect-error
    const currentDiscoveryState: DiscoveryState = state.discovery

    if (
        (!currentAccountState || Object.keys(currentAccountState).length === 0) &&
        (!currentDiscoveryState || Object.keys(currentDiscoveryState).length === 0)
    ) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newAccountState = {
        ...currentAccountState,
        accounts: currentAccountState.accounts.map(acc => ({
            ...acc,
            profileImage: acc.profileImage
                ? {
                      ...acc.profileImage,
                      uri: acc.profileImage.uri.substring(acc.profileImage.uri.indexOf("pfp/")),
                  }
                : undefined,
        })),
    } satisfies AccountSliceState

    const newDiscoveryState = {
        ...currentDiscoveryState,
        tabsManager: {
            currentTabId: currentDiscoveryState.tabsManager.currentTabId,
            tabs: currentDiscoveryState.tabsManager.tabs.map(tab => ({
                ...tab,
                previewPath: tab.previewPath
                    ? tab.previewPath.substring(tab.previewPath.indexOf("screenshots/"))
                    : undefined,
            })),
        },
    } satisfies DiscoveryState

    return {
        ...state,
        accounts: newAccountState,
        discovery: newDiscoveryState,
    } as PersistedState
}
