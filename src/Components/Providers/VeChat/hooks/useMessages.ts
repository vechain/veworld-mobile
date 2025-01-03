import { useVeChat } from "../VeChatProvider"
import { useConversation } from "./useConversation"
import { useQuery } from "@tanstack/react-query"

export function useMessages({ topic }: { topic: string }) {
    const { selectedClient } = useVeChat()
    const { data: conversation } = useConversation({ topic })

    return useQuery({
        queryKey: ["veChat", "messages", selectedClient?.address, topic],
        queryFn: async () => {
            return (await conversation?.messages()) || []
        },
        enabled: !!selectedClient && !!conversation,
    })
}
