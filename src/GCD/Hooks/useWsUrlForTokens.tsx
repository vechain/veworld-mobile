import { useMemo } from "react"
import { TRANSFER_SIGNATURE } from "../Helpers"
import { URLUtils, error, info } from "~Utils"
import useWebSocket from "react-use-websocket"
import { updateNodeError, useAppDispatch } from "~Storage/Redux"

export const useWsUrlForTokens = (
    currentNetworkUrl: string,
    onTokenMessage: (ev: WebSocketMessageEvent) => void,
) => {
    const dispatch = useAppDispatch()

    const wsUrlForTokens = useMemo(() => {
        return URLUtils.toWebsocketURL(
            currentNetworkUrl,
            `/subscriptions/event?t0=${TRANSFER_SIGNATURE}`,
        )
    }, [currentNetworkUrl])

    useWebSocket(wsUrlForTokens, {
        onMessage: onTokenMessage,
        share: true,
        onOpen: ev => {
            info("Beat WS open on: ", ev.currentTarget)
            dispatch(updateNodeError(false))
        },
        onError: ev => {
            error("useWsUrlForTokens WS Error: ", ev)
        },
        onClose: ev => info(ev),
        shouldReconnect: () => true,
        retryOnError: true,
        reconnectAttempts: 10_000,
        reconnectInterval: 1_000,
    })
}
