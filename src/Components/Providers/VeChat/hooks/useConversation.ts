import { Conversation } from "@xmtp/react-native-sdk"
import { useVeChat } from "../VeChatProvider"
import { useQuery } from "@tanstack/react-query"

type Props = {
    topic: string
}

export function useConversation({ topic }: Props) {
    const { selectedClient } = useVeChat()
    return useQuery<Conversation[], unknown, Conversation | undefined>({
        queryKey: ["veChat", "conversations", selectedClient?.address, topic],
        queryFn: async () => selectedClient!.conversations.list(),
        select: conversations => conversations.find(c => c.topic === topic),
        enabled: !!selectedClient && !!topic,
    })
}
