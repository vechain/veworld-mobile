import { useQuery } from "@tanstack/react-query"
import { useVeChat } from "../VeChatProvider"
import { selectConversations, useAppSelector } from "~Storage/Redux"
import { Conversation } from "@xmtp/react-native-sdk"
import { VeChatConversation } from "~Storage/Redux/Types"

export type EnhancedConversation = Conversation & VeChatConversation

export function useConversations() {
    const { selectedClient } = useVeChat()
    const conversations = useAppSelector(selectConversations)

    return useQuery({
        queryKey: ["veChat", "conversations", selectedClient?.address],
        queryFn: async () => {
            await selectedClient?.conversations.sync()
            return (await selectedClient?.conversations.list()) || []
        },
        select: convs => {
            return convs.reduce((acc: EnhancedConversation[], current) => {
                // Return conversations only if they are not deleted or denied
                if (current.state !== "denied" && !conversations[current.topic].deletedAt)
                    acc.push(Object.assign(current, conversations[current.topic]) as EnhancedConversation)
                return acc
            }, [] as EnhancedConversation[])
        },
        staleTime: 0,
        enabled: !!selectedClient,
    })
}
