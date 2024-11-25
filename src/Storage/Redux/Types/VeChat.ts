export type VeChatNetwork = "local" | "dev" | "production"

type VeChatConversation = {}

export type VeChatConversations = {
    [conversationId: string]: VeChatConversation
}
