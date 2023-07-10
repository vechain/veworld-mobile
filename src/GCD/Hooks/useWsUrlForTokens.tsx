import { useCallback, useMemo } from "react"
import { TRANSFER_SIGNATURE } from "../Helpers"
import { URLUtils, error, info, warn } from "~Utils"
import useWebSocket from "react-use-websocket"
import { updateNodeError, useAppDispatch } from "~Storage/Redux"
import { useCounter } from "~Hooks"

export const useWsUrlForTokens = (
    currentNetworkUrl: string,
    onTokenMessage: (ev: WebSocketMessageEvent) => void,
) => {
    const dispatch = useAppDispatch()
    const { count, increment } = useCounter()

    const onOpen = () => {
        dispatch(updateNodeError(false))
    }

    const onError = useCallback(
        (ev: WebSocketErrorEvent) => {
            error("Error on beat WS: ", ev)

            if (count > 3) {
                warn("Troubles connecting to useWsUrlForTokens.")
                dispatch(updateNodeError(true))
            } else {
                increment()
            }
        },
        [count, dispatch, increment],
    )

    const shouldReconnect = useCallback((closeEvent: WebSocketCloseEvent) => {
        const log = closeEvent.isTrusted ? info : warn
        log("Will attempt to reconnect web socket after closure", closeEvent)

        // TODO: //Attempt to use another node if the current one has issues
        //Not doing async because the result should not affect this function
        // if (!closeEvent.wasClean && network.defaultNet) {
        //     dispatch(changeSelectedNetwork(network.id))
        //         .then(e => info(e))
        //         .catch(e => warn(e))
        // }
        return true
    }, [])

    const wsUrlForTokens = useMemo(() => {
        return URLUtils.toWebsocketURL(
            currentNetworkUrl,
            `/subscriptions/event?t0=${TRANSFER_SIGNATURE}`,
        )
    }, [currentNetworkUrl])

    useWebSocket(wsUrlForTokens, {
        onMessage: ev => {
            dispatch(updateNodeError(false))
            onTokenMessage(ev)
        },
        share: true,
        onOpen: onOpen,
        onError: onError,
        onClose: ev => info(ev),
        shouldReconnect,
        retryOnError: true,
        reconnectAttempts: 10_000,
        reconnectInterval: 1_000,
    })
}
