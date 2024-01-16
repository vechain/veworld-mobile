import { error, info } from "~Utils/Logger"
import URIUtils from "../URIUtils"
import { ERROR_EVENTS } from "~Constants"

/**
 * Verify a websocket connection for a given URL.
 *
 * Some nodes allow regular connections but block websockets due to Cors config.
 * This will ensure the node we are adding/ switching to will not impact the app negatively
 *
 * The websocket is always closed on success or failure
 *
 * @param url - the url to verify
 * @param timeout - the amount of time to wait
 *
 * @throws a VeWorldError if the connection fails (defaults to 5 seconds)
 */
const verifyWebSocketConnection = async (url: string, timeout = 5000) => {
    await new Promise<void>(function (resolve, reject) {
        setTimeout(() => reject("Node timed out"), timeout)
        const wsUrl = URIUtils.toNodeBeatWebsocketUrl(url)
        const webSocket = new WebSocket(wsUrl)

        webSocket.onopen = () => {
            info(ERROR_EVENTS.APP, "Websocket opened")
            resolve()
            webSocket.close()
        }

        webSocket.onerror = () => {
            error(ERROR_EVENTS.APP, "Websocket errored")
            reject("Failed to test WS connection")
            webSocket.close()
        }

        webSocket.onclose = e => info(ERROR_EVENTS.APP, "Websocket closed", e)
    })
}

export default { verifyWebSocketConnection }
