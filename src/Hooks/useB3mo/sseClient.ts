export type B3moSseEvent =
    | { type: "session"; sessionId: string; title?: string }
    | { type: "text_delta"; content: string }
    | { type: "tool_call_start"; toolCallId: string; toolName: string; args: unknown }
    | { type: "tool_call_result"; toolCallId: string; result: unknown }
    | {
          type: "exec_clauses"
          toolCallId: string
          toolName: string
          network: "mainnet" | "testnet"
          clauses: { to: string; value: string; data: string; comment?: string }[]
          gasHint?: number
          summary?: string
      }
    | { type: "error"; message: string; code?: string }
    | { type: "done" }

export type B3moSseHandlers = {
    onEvent: (event: B3moSseEvent) => void
    onClose?: () => void
    onError?: (error: Error) => void
}

export class B3moSseClient {
    private xhr: XMLHttpRequest | null = null
    private buffer = ""
    private cursor = 0

    open(url: string, jwt: string, handlers: B3moSseHandlers): void {
        const xhr = new XMLHttpRequest()
        this.xhr = xhr
        xhr.open("GET", url, true)
        xhr.setRequestHeader("Accept", "text/event-stream")
        xhr.setRequestHeader("Authorization", `Bearer ${jwt}`)

        xhr.onprogress = () => {
            this.buffer = xhr.responseText
            this.consumeBuffer(handlers.onEvent)
        }

        xhr.onerror = () => {
            handlers.onError?.(new Error("SSE network error"))
        }

        xhr.onload = () => {
            this.buffer = xhr.responseText
            this.consumeBuffer(handlers.onEvent)
            handlers.onClose?.()
        }

        xhr.send()
    }

    close(): void {
        try {
            this.xhr?.abort()
        } catch {}
        this.xhr = null
        this.buffer = ""
        this.cursor = 0
    }

    private consumeBuffer(emit: (event: B3moSseEvent) => void): void {
        while (this.cursor < this.buffer.length) {
            const sep = this.buffer.indexOf("\n\n", this.cursor)
            if (sep === -1) return
            const block = this.buffer.slice(this.cursor, sep)
            this.cursor = sep + 2
            const lines = block.split("\n")
            const dataLines = lines.filter(l => l.startsWith("data:")).map(l => l.slice(5).trimStart())
            if (dataLines.length === 0) continue
            const json = dataLines.join("\n")
            try {
                emit(JSON.parse(json) as B3moSseEvent)
            } catch {
                // ignore malformed events
            }
        }
    }
}
