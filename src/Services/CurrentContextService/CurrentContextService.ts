export const CURRENT_CONTEXT_KEY = "current-context"
import { debug } from "~Common/Logger/Logger"

/**
 * Stores the id of the current context
 * @returns
 */

const get = async (): Promise<string> => {
    debug("Getting the current context")
    return (await chrome.storage.session.get([CURRENT_CONTEXT_KEY]))[
        CURRENT_CONTEXT_KEY
    ]
}

const update = async (contextId: string): Promise<void> => {
    debug("Updating current context")
    chrome.storage.session.set({ [CURRENT_CONTEXT_KEY]: contextId })
}

const reset = async (): Promise<void> => {
    debug("Removing current context")
    chrome.storage.session.remove(CURRENT_CONTEXT_KEY)
}

export default {
    get,
    update,
    reset,
}
