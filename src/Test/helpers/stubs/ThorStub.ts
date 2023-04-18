import MockAdapter from "axios-mock-adapter"
import { VTHO } from "~Common"
import { Action } from "./consts"

export const mockThorTransactions = (
    mockAdapter: MockAdapter,
    action = Action.SUCCESS,
    response = JSON.stringify([VTHO]),
) => {
    const matcher = mockAdapter.onPost(
        "https://vethor-node-test.vechaindev.com/transactions",
    )

    if (action === Action.SUCCESS) matcher.reply(200, response)
    else if (action === Action.ABORT) matcher.abortRequest()
    else if (action === Action.NETWORK_ERROR) matcher.networkError()
    else if (action === Action.API_ERROR) matcher.reply(403)
    else if (action === Action.TIMEOUT) matcher.timeout()
}
