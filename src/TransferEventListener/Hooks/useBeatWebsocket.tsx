import { useCallback, useEffect, useRef, useState } from "react"
import { URIUtils, debug, error, warn } from "~Utils"
import WebSocket, { CloseEvent, ErrorEvent, MessageEvent } from "isomorphic-ws"
import { updateNodeError, useAppDispatch } from "~Storage/Redux"
import { useAppState, useCounter } from "~Hooks"
import { AppStateType, Beat } from "~Model"
import { ERROR_EVENTS } from "~Constants"

interface LastMessage {
    networkUrl: string
    messageId: string
    timestamp: number
}

const TEN_MINUTES = 10 * 60 * 1000

const BASE_PATH = "/subscriptions/beat2"
export const useBeatWebsocket = (currentNetworkUrl: string, onMessage: (beat: Beat) => void) => {
    const dispatch = useAppDispatch()
    const { currentState, previousState } = useAppState()
    const ws = useRef<WebSocket>()
    const lastMessage = useRef<LastMessage>()
    const { count, increment } = useCounter()
    const [retryTimeoutId, setRetryTimeoutId] = useState<NodeJS.Timeout | null>(null)

    const onOpen = useCallback(() => {
        dispatch(updateNodeError(false))
    }, [dispatch])

    const onMessageWrapper = useCallback(
        (ev: MessageEvent) => {
            const message = JSON.parse(ev.data.toString()) as Beat
            onMessage(message)
            lastMessage.current = {
                networkUrl: currentNetworkUrl,
                messageId: message.id,
                timestamp: Date.now(),
            }
        },
        [currentNetworkUrl, onMessage],
    )

    const onClose = useCallback(
        (ev: CloseEvent) => {
            warn(ERROR_EVENTS.SEND, "Websocket closed", ev)

            if (currentState === AppStateType.ACTIVE) {
                setRetryTimeoutId(setTimeout(() => ws.current?.close(100, "Restarting websocket"), 10000))
            }
        },
        [currentState],
    )

    const onError = useCallback(
        (ev: ErrorEvent) => {
            error(ERROR_EVENTS.APP, "Error in Beat WebSocket ", ev)

            if (count > 3) {
                warn(ERROR_EVENTS.SEND, "Trouble connecting to useBeatWebsocket.")
                dispatch(updateNodeError(true))
            } else {
                increment()
            }
        },
        [count, dispatch, increment],
    )

    // Effect for opening and closing WebSocket connection
    useEffect(() => {
        if (currentState === AppStateType.ACTIVE) {
            debug(ERROR_EVENTS.APP, "Opening websocket")
            ws.current?.close(1000, "Restarting websocket")

            const url = new URL(URIUtils.toWebsocketURL(currentNetworkUrl, BASE_PATH))
            if (
                lastMessage.current?.networkUrl === currentNetworkUrl &&
                lastMessage.current?.timestamp + TEN_MINUTES > Date.now()
            ) {
                url.searchParams.append("pos", lastMessage.current?.messageId)
            }
            ws.current = new WebSocket(url.toString())
        } else if (currentState === AppStateType.BACKGROUND && previousState === AppStateType.ACTIVE) {
            debug(ERROR_EVENTS.APP, "Closing websocket")
            ws.current?.close(1001, "App is in background")
            if (retryTimeoutId) {
                clearTimeout(retryTimeoutId)
            }
        }
        return () => {
            ws.current?.close(1002, "Unmounting component")
            if (retryTimeoutId) {
                clearTimeout(retryTimeoutId)
            }
        }
    }, [currentNetworkUrl, currentState, previousState, retryTimeoutId])

    useEffect(() => {
        // Reset lastMessage when currentNetworkUrl changes
        lastMessage.current = undefined
    }, [currentNetworkUrl])

    // Effect for attaching and detaching event listeners
    useEffect(() => {
        if (ws.current) {
            ws.current.onmessage = onMessageWrapper
            ws.current.onerror = onError
            ws.current.onopen = onOpen
            ws.current.onclose = onClose

            return () => {
                if (ws.current) {
                    ws.current.onmessage = null
                    ws.current.onerror = null
                    ws.current.onopen = null
                    ws.current.onclose = null
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onClose, onError, onMessageWrapper, onOpen, ws.current])
}
