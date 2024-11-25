import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { DecodedMessage } from "@xmtp/react-native-sdk"
import { useVeChat } from "../VeChatProvider"
import { useConversation } from "./useConversation"

export function useMessages({ topic }: { topic: string }): UseQueryResult<DecodedMessage[]> {
    const { selectedClient } = useVeChat()
    const { data: conversation } = useConversation({ topic })

    return useQuery<DecodedMessage[]>({
        queryKey: ["veChat", "messages", selectedClient?.address, conversation?.topic],
        queryFn: () => conversation!.messages(),
        select: messages => {
            return messages
        },
        enabled: !!selectedClient && !!topic && !!conversation,
    })
}
