import { PersistedState } from "redux-persist"
import { defaultMainNetwork, defaultTestNetwork, ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { ContactsSliceState } from "../Slices"

export const Migration35 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 35: Adding recent contacts state")

    // @ts-expect-error
    const currentContactsState: ContactsSliceState = state.contacts

    const newContactsState = {
        ...currentContactsState,
        recentContacts: {
            ...currentContactsState.recentContacts,
            [defaultMainNetwork.genesis.id]: {},
            [defaultTestNetwork.genesis.id]: {},
        },
    } satisfies ContactsSliceState

    return {
        ...state,
        contacts: newContactsState,
    } as PersistedState
}
