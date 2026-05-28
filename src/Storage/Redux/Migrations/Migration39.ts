import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"

export const Migration39 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 39: Adding B3MO execution mode")

    const previous = (state ?? {}) as PersistedState & {
        b3mo?: { executionMode?: "auto" | "confirm"; [key: string]: unknown }
    }

    return {
        ...previous,
        b3mo: {
            ...(previous.b3mo ?? {}),
            // Existing users default to "confirm" too — they must opt-in to autonomous execution.
            executionMode: previous.b3mo?.executionMode ?? "confirm",
        },
    } as PersistedState
}
