import { veWorldErrors } from "~Common/Errors"
import { debug, warn } from "~Common/Logger"
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

    try {
        await new Promise<void>(function (onSuccess, onFailure) {
            setTimeout(
                () =>
                    onFailure(
                        veWorldErrors.provider.disconnected({
                            message: "Node timed out",
                        }),
                    ),
                timeout,
            )
            const wsUrl = URLUtils.toWebsocketURL(url, "/subscriptions/beat2")
            const webSocket = new WebSocket(wsUrl)

            webSocket.onopen = () => {
                onSuccess()
                webSocket.close()
            }

            webSocket.onerror = () => {
                onFailure(
                    veWorldErrors.provider.disconnected({
                        message: "Failed to test WS connection",
                    }),
                )
                webSocket.close()
            }

            webSocket.onclose = () => warn("Websocket closed")
        })
    } catch (e) {
        throw veWorldErrors.rpc.internal({
            message: "Failed to test WS connection",
            error: e,
        })
    }
}

export default { verifyWebSocketConnection }
