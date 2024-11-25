import { useQuery } from "@tanstack/react-query"
import { useVeChat } from "../VeChatProvider"

export function useConversations() {
    const { selectedClient } = useVeChat()
    return useQuery({
        queryKey: ["veChat", "conversations", selectedClient?.address],
        queryFn: async () => {
            await selectedClient?.conversations.sync()
            return (await selectedClient?.conversations.list()) || []
        },
        enabled: !!selectedClient,
    })
}
