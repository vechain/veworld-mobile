import { useCallback, useEffect, useMemo, useState } from "react"
import { URIUtils, error, info, warn } from "~Utils"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { updateNodeError, useAppDispatch } from "~Storage/Redux"
import { useCounter } from "~Hooks"
import { Beat } from "~Model"

const BASE_PATH = "/subscriptions/beat2"
export const useBeatWebsocket = (
    currentNetworkUrl: string,
    onMessage: (ev: WebSocketMessageEvent) => void,
) => {
    const dispatch = useAppDispatch()
    const [wsPath, setWsPath] = useState(BASE_PATH)
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
        return URIUtils.toWebsocketURL(currentNetworkUrl, wsPath)
    }, [currentNetworkUrl, wsPath])

    const { readyState, lastMessage } = useWebSocket(wsUrlForBeat, {
        onMessage: onMessage,
        onOpen: onOpen,
        onError: onError,
        onClose: ev => info(ev),
        shouldReconnect,
        retryOnError: true,
        reconnectAttempts: 10000,
        reconnectInterval: 1000,
    })

    useEffect(() => {
        setWsPath(BASE_PATH)
    }, [currentNetworkUrl])

    useEffect(() => {
        if (readyState === ReadyState.CLOSED && lastMessage) {
            try {
                const message = JSON.parse(lastMessage.data) as Beat

                // Change the URL before the reconnect happens
                setWsPath(`${BASE_PATH}?pos=${message.id}`)
            } catch (e) {
                error("Error parsing lastMessage.data", e)
            }
        }
    }, [readyState, lastMessage])
}
