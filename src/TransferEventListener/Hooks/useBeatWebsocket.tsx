import { useCallback, useMemo } from "react"
import { URIUtils, error, info, warn } from "~Utils"
import useWebSocket from "react-use-websocket"
import { updateNodeError, useAppDispatch } from "~Storage/Redux"
import { useCounter } from "~Hooks"

export const useBeatWebsocket = (
    currentNetworkUrl: string,
    onMessage: (ev: WebSocketMessageEvent) => void,
) => {
    const dispatch = useAppDispatch()
    const { count, increment } = useCounter()

    const onOpen = () => {
        dispatch(updateNodeError(false))
    }

    const onError = useCallback(
        (ev: WebSocketErrorEvent) => {
            error("Error in VET Transfer WS: ", ev)

            if (count > 3) {
                warn("Trouble connecting to useBeatWebsocket.")
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

        // TODO (Erik) (https://github.com/vechainfoundation/veworld-mobile/issues/747) Attempt to use another node if the current one has issues
        //Not doing async because the result should not affect this function
        // if (!closeEvent.wasClean && network.defaultNet) {
        //     dispatch(changeSelectedNetwork(network.id))
        //         .then(e => info(e))
        //         .catch(e => warn(e))
        // }
        return true
    }, [])

    const wsUrlForBeat = useMemo(() => {
        return URIUtils.toWebsocketURL(
            currentNetworkUrl,
            "/subscriptions/beat2",
        )
    }, [currentNetworkUrl])

    useWebSocket(wsUrlForBeat, {
        onMessage: onMessage,
        onOpen: onOpen,
        onError: onError,
        onClose: ev => info(ev),
        shouldReconnect,
        retryOnError: true,
        reconnectAttempts: 10_000,
        reconnectInterval: 1_000,
    })
}
