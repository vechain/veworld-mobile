import axios from "axios"
import { useCallback, useEffect, useRef, useState } from "react"
import { B3MO_BACKEND_URL } from "~Constants"
import { setB3moCurrentSession, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectB3moCurrentSessionId, selectB3moJwt } from "~Storage/Redux/Selectors/B3mo"
import { B3moSseClient, type B3moSseEvent } from "./sseClient"
import { useB3moExecutor } from "./useB3moExecutor"

export type ChatMessage =
    | { id: string; role: "user"; content: string }
    | { id: string; role: "assistant"; content: string; toolCalls: ToolCallView[] }

export type ToolCallView = {
    id: string
    name: string
    args: unknown
    summary?: string
    status: "pending" | "executing" | "success" | "failed"
    txId?: string
    network?: "mainnet" | "testnet"
    error?: string
}

export type B3moSendOptions = {
    sessionId?: string
    network?: "mainnet" | "testnet"
}

export type B3moListedSession = {
    id: string
    title?: string
    createdAt: number
    updatedAt: number
    messageCount: number
}

export const useB3moClient = () => {
    const dispatch = useAppDispatch()
    const jwt = useAppSelector(selectB3moJwt)
    const currentSessionId = useAppSelector(selectB3moCurrentSessionId)
    const { execute } = useB3moExecutor()

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | undefined>()
    const sseRef = useRef<B3moSseClient | null>(null)

    useEffect(() => {
        return () => sseRef.current?.close()
    }, [])

    const send = useCallback(
        async (text: string, opts: B3moSendOptions = {}) => {
            if (!jwt) {
                setError("Not authenticated")
                return
            }
            setError(undefined)
            const initialSessionId = opts.sessionId ?? currentSessionId
            const network = opts.network ?? "mainnet"

            const userMsg: ChatMessage = {
                id: `u_${Date.now()}`,
                role: "user",
                content: text,
            }
            const assistantId = `a_${Date.now()}`
            const assistantMsg: ChatMessage = {
                id: assistantId,
                role: "assistant",
                content: "",
                toolCalls: [],
            }
            setMessages(prev => [...prev, userMsg, assistantMsg])

            sseRef.current?.close()
            const client = new B3moSseClient()
            sseRef.current = client
            setIsStreaming(true)

            const params = new URLSearchParams()
            if (initialSessionId) params.set("sessionId", initialSessionId)
            params.set("message", text)
            params.set("network", network)
            const url = `${B3MO_BACKEND_URL}/chat/stream?${params.toString()}`

            let liveSessionId: string | undefined = initialSessionId

            const onEvent = async (event: B3moSseEvent) => {
                switch (event.type) {
                    case "session":
                        liveSessionId = event.sessionId
                        dispatch(setB3moCurrentSession({ sessionId: event.sessionId }))
                        break
                    case "text_delta":
                        setMessages(prev =>
                            updateAssistant(prev, assistantId, m => ({
                                ...m,
                                content: m.content + event.content,
                            })),
                        )
                        break
                    case "tool_call_start":
                        setMessages(prev =>
                            updateAssistant(prev, assistantId, m => ({
                                ...m,
                                toolCalls: [
                                    ...m.toolCalls,
                                    {
                                        id: event.toolCallId,
                                        name: event.toolName,
                                        args: event.args,
                                        status: "pending",
                                    },
                                ],
                            })),
                        )
                        break
                    case "tool_call_result":
                        setMessages(prev =>
                            updateAssistant(prev, assistantId, m => ({
                                ...m,
                                toolCalls: m.toolCalls.map(tc =>
                                    tc.id === event.toolCallId
                                        ? {
                                              ...tc,
                                              status: isErrorResult(event.result)
                                                  ? "failed"
                                                  : tc.status === "executing"
                                                  ? tc.status
                                                  : "success",
                                              error: extractError(event.result),
                                          }
                                        : tc,
                                ),
                            })),
                        )
                        break
                    case "exec_clauses": {
                        setMessages(prev =>
                            updateAssistant(prev, assistantId, m => ({
                                ...m,
                                toolCalls: m.toolCalls.map(tc =>
                                    tc.id === event.toolCallId
                                        ? {
                                              ...tc,
                                              status: "executing",
                                              summary: event.summary,
                                              network: event.network,
                                          }
                                        : tc,
                                ),
                            })),
                        )
                        if (!liveSessionId) {
                            setMessages(prev =>
                                updateAssistant(prev, assistantId, m => ({
                                    ...m,
                                    toolCalls: m.toolCalls.map(tc =>
                                        tc.id === event.toolCallId
                                            ? { ...tc, status: "failed", error: "No active session" }
                                            : tc,
                                    ),
                                })),
                            )
                            return
                        }
                        const result = await execute({
                            sessionId: liveSessionId,
                            toolCallId: event.toolCallId,
                            network: event.network,
                            clauses: event.clauses,
                            gasHint: event.gasHint,
                        })
                        setMessages(prev =>
                            updateAssistant(prev, assistantId, m => ({
                                ...m,
                                toolCalls: m.toolCalls.map(tc =>
                                    tc.id === event.toolCallId
                                        ? {
                                              ...tc,
                                              status: result.success ? "success" : "failed",
                                              txId: result.success ? result.txId : undefined,
                                              error: result.success ? undefined : result.error,
                                          }
                                        : tc,
                                ),
                            })),
                        )
                        break
                    }
                    case "error":
                        setMessages(prev =>
                            updateAssistant(prev, assistantId, m => ({
                                ...m,
                                content: m.content + `\n\n_Error: ${event.message}_`,
                            })),
                        )
                        setError(event.message)
                        break
                    case "done":
                        break
                }
            }

            client.open(url, jwt, {
                onEvent,
                onClose: () => setIsStreaming(false),
                onError: e => {
                    setError(e.message)
                    setIsStreaming(false)
                },
            })
        },
        [jwt, currentSessionId, execute, dispatch],
    )

    const startNewSession = useCallback(() => {
        dispatch(setB3moCurrentSession({ sessionId: undefined }))
        setMessages([])
        setError(undefined)
    }, [dispatch])

    const loadSession = useCallback(
        async (sessionId: string) => {
            if (!jwt) return
            dispatch(setB3moCurrentSession({ sessionId }))
            const res = await axios.get(`${B3MO_BACKEND_URL}/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            })
            const transcript = (res.data.messages ?? []) as RawMessage[]
            setMessages(rebuildMessages(transcript))
        },
        [jwt, dispatch],
    )

    const listSessions = useCallback(async (): Promise<B3moListedSession[]> => {
        if (!jwt) return []
        const res = await axios.get<B3moListedSession[]>(`${B3MO_BACKEND_URL}/sessions`, {
            headers: { Authorization: `Bearer ${jwt}` },
        })
        return res.data
    }, [jwt])

    const deleteSession = useCallback(
        async (sessionId: string) => {
            if (!jwt) return
            await axios.delete(`${B3MO_BACKEND_URL}/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            })
            if (currentSessionId === sessionId) {
                startNewSession()
            }
        },
        [jwt, currentSessionId, startNewSession],
    )

    return {
        messages,
        isStreaming,
        error,
        send,
        startNewSession,
        loadSession,
        listSessions,
        deleteSession,
    }
}

function updateAssistant(
    messages: ChatMessage[],
    id: string,
    updater: (m: Extract<ChatMessage, { role: "assistant" }>) => Extract<ChatMessage, { role: "assistant" }>,
): ChatMessage[] {
    return messages.map(m => (m.id === id && m.role === "assistant" ? updater(m) : m))
}

type RawMessage =
    | { role: "user"; content: string }
    | {
          role: "assistant"
          content: string | null
          tool_calls?: { id: string; function: { name: string; arguments: string } }[]
      }
    | { role: "tool"; tool_call_id: string; content: string }

function rebuildMessages(raw: RawMessage[]): ChatMessage[] {
    const out: ChatMessage[] = []
    let i = 0
    for (const msg of raw) {
        if (msg.role === "user") {
            out.push({ id: `u_${i++}`, role: "user", content: msg.content })
        } else if (msg.role === "assistant") {
            const toolCalls: ToolCallView[] = (msg.tool_calls ?? []).map(tc => ({
                id: tc.id,
                name: tc.function.name,
                args: safeJson(tc.function.arguments),
                status: "success",
            }))
            out.push({
                id: `a_${i++}`,
                role: "assistant",
                content: msg.content ?? "",
                toolCalls,
            })
        }
    }
    return out
}

function safeJson(s: string): unknown {
    try {
        return JSON.parse(s)
    } catch {
        return s
    }
}

function isErrorResult(result: unknown): boolean {
    return typeof result === "object" && result !== null && "error" in (result as object)
}

function extractError(result: unknown): string | undefined {
    if (typeof result === "object" && result !== null && "error" in (result as object)) {
        const v = (result as { error?: unknown }).error
        return typeof v === "string" ? v : JSON.stringify(v)
    }
    return undefined
}
