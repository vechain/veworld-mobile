import axios from "axios"
import { useCallback, useEffect, useRef, useState } from "react"
import { B3MO_BACKEND_URL } from "~Constants"
import { setB3moCurrentSession, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectB3moCurrentSessionId, selectB3moExecutionMode, selectB3moJwt } from "~Storage/Redux/Selectors/B3mo"
import { B3moSseClient, type B3moSseEvent } from "./sseClient"
import { useB3moExecutor, type B3moClause } from "./useB3moExecutor"

export type ToolCallStatus = "pending" | "awaiting_approval" | "executing" | "success" | "failed"

export type ChatMessage =
    | { id: string; role: "user"; content: string }
    | { id: string; role: "assistant"; content: string; toolCalls: ToolCallView[] }

export type ToolCallView = {
    id: string
    name: string
    args: unknown
    summary?: string
    status: ToolCallStatus
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

type PendingExec = {
    sessionId: string
    toolCallId: string
    network: "mainnet" | "testnet"
    clauses: B3moClause[]
    gasHint?: number
    assistantMessageId: string
    decide: (decision: "approve" | "reject") => void
}

const REJECTION_ERROR = "Rejected by user"

export const useB3moClient = () => {
    const dispatch = useAppDispatch()
    const jwt = useAppSelector(selectB3moJwt)
    const currentSessionId = useAppSelector(selectB3moCurrentSessionId)
    const executionMode = useAppSelector(selectB3moExecutionMode)
    const { execute } = useB3moExecutor()

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | undefined>()
    const [isLoadingTranscript, setIsLoadingTranscript] = useState(false)
    const sseRef = useRef<B3moSseClient | null>(null)
    const loadedSessionIdRef = useRef<string | undefined>(undefined)
    const pendingExecsRef = useRef<Map<string, PendingExec>>(new Map())
    // Always read the latest mode at the moment a clause arrives.
    const executionModeRef = useRef(executionMode)
    useEffect(() => {
        executionModeRef.current = executionMode
    }, [executionMode])

    useEffect(() => {
        return () => sseRef.current?.close()
    }, [])

    useEffect(() => {
        if (!jwt) return
        if (loadedSessionIdRef.current === currentSessionId) return
        if (!currentSessionId) {
            loadedSessionIdRef.current = undefined
            setMessages([])
            return
        }
        let cancelled = false
        setIsLoadingTranscript(true)
        ;(async () => {
            try {
                const res = await axios.get(`${B3MO_BACKEND_URL}/sessions/${currentSessionId}`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                })
                if (cancelled) return
                const transcript = (res.data.messages ?? []) as RawMessage[]
                setMessages(rebuildMessages(transcript))
                loadedSessionIdRef.current = currentSessionId
            } catch {
                // ignore — keep whatever messages we have
            } finally {
                if (!cancelled) setIsLoadingTranscript(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [jwt, currentSessionId])

    const reportRejection = useCallback(
        async (sessionId: string, toolCallId: string) => {
            if (!jwt) return
            try {
                await axios.post(
                    `${B3MO_BACKEND_URL}/chat/exec-result`,
                    { sessionId, toolCallId, success: false, error: REJECTION_ERROR },
                    { headers: { Authorization: `Bearer ${jwt}` } },
                )
            } catch {
                // best-effort
            }
        },
        [jwt],
    )

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
                        loadedSessionIdRef.current = event.sessionId
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
                                                  : tc.status === "executing" || tc.status === "awaiting_approval"
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
                        const sessionId = liveSessionId
                        const mode = executionModeRef.current
                        if (mode === "confirm") {
                            // Wait for user decision via a Promise stored in pendingExecsRef.
                            const decision = await new Promise<"approve" | "reject">(resolve => {
                                pendingExecsRef.current.set(event.toolCallId, {
                                    sessionId,
                                    toolCallId: event.toolCallId,
                                    network: event.network,
                                    clauses: event.clauses,
                                    gasHint: event.gasHint,
                                    assistantMessageId: assistantId,
                                    decide: resolve,
                                })
                                setMessages(prev =>
                                    updateAssistant(prev, assistantId, m => ({
                                        ...m,
                                        toolCalls: m.toolCalls.map(tc =>
                                            tc.id === event.toolCallId
                                                ? {
                                                      ...tc,
                                                      status: "awaiting_approval",
                                                      summary: event.summary,
                                                      network: event.network,
                                                  }
                                                : tc,
                                        ),
                                    })),
                                )
                            })
                            pendingExecsRef.current.delete(event.toolCallId)
                            if (decision === "reject") {
                                await reportRejection(sessionId, event.toolCallId)
                                setMessages(prev =>
                                    updateAssistant(prev, assistantId, m => ({
                                        ...m,
                                        toolCalls: m.toolCalls.map(tc =>
                                            tc.id === event.toolCallId
                                                ? { ...tc, status: "failed", error: REJECTION_ERROR }
                                                : tc,
                                        ),
                                    })),
                                )
                                return
                            }
                        }

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
                        const result = await execute({
                            sessionId,
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
        [jwt, currentSessionId, execute, dispatch, reportRejection],
    )

    const approveToolCall = useCallback((toolCallId: string) => {
        pendingExecsRef.current.get(toolCallId)?.decide("approve")
    }, [])

    const rejectToolCall = useCallback((toolCallId: string) => {
        pendingExecsRef.current.get(toolCallId)?.decide("reject")
    }, [])

    const startNewSession = useCallback(() => {
        // Auto-reject any in-flight approvals from the previous session.
        for (const [, pending] of pendingExecsRef.current) pending.decide("reject")
        pendingExecsRef.current.clear()
        loadedSessionIdRef.current = undefined
        dispatch(setB3moCurrentSession({ sessionId: undefined }))
        setMessages([])
        setError(undefined)
    }, [dispatch])

    const loadSession = useCallback(
        async (sessionId: string) => {
            dispatch(setB3moCurrentSession({ sessionId }))
        },
        [dispatch],
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
        isLoadingTranscript,
        error,
        send,
        startNewSession,
        loadSession,
        listSessions,
        deleteSession,
        approveToolCall,
        rejectToolCall,
        executionMode,
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
