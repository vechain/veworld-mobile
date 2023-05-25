import { debug, error, warn } from "~Common/Logger"
import URLUtils from "../URLUtils"

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
    debug("Verifying websocket connection")

    await new Promise<void>(function (resolve, reject) {
        setTimeout(() => reject("Node timed out"), timeout)
        const wsUrl = URLUtils.toNodeBeatWebsocketUrl(url)
        const webSocket = new WebSocket(wsUrl)

        webSocket.onopen = () => {
            debug("Websocket opened")
            resolve()
            webSocket.close()
        }

        webSocket.onerror = () => {
            error("Websocket errored")
            reject("Failed to test WS connection")
            webSocket.close()
        }

        webSocket.onclose = e => warn("Websocket closed", e)
    })
}

export default { verifyWebSocketConnection }
