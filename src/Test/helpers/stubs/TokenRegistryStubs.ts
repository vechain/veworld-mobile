import MockAdapter from "axios-mock-adapter"
import { VTHO } from "~Constants"
import { Action } from "./consts"

export const mockTokenRegistry = (
    mockAdapter: MockAdapter,
    action = Action.SUCCESS,
) => {
    const matcher = mockAdapter.onGet(
        "https://vechain.github.io/token-registry/test.json",
    )

    if (action === Action.SUCCESS) matcher.reply(200, JSON.stringify([VTHO]))
    else if (action === Action.ABORT) matcher.abortRequest()
    else if (action === Action.NETWORK_ERROR) matcher.networkError()
    else if (action === Action.API_ERROR) matcher.reply(403)
    else if (action === Action.TIMEOUT) matcher.timeout()
}
