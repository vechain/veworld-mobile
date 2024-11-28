export type VeChatNetwork = "local" | "dev" | "production"

export type VeChatConversation = {
    unreadMessages: number
    lastRead: number
    createdAt: number
    updatedAt: number
    deletedAt?: number
}

export type VeChatConversations = {
    [topic: string]: VeChatConversation
}
