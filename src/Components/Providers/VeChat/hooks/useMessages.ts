import { DecodedMessage } from "@xmtp/react-native-sdk"
import { useVeChat } from "../VeChatProvider"
import { useConversation } from "./useConversation"
import { useMMKV, useMMKVObject } from "react-native-mmkv"

export function useMessages({ topic }: { topic: string }): DecodedMessage[] {
    const { selectedClient } = useVeChat()
    const { data: conversation } = useConversation({ topic })
    const chatStorage = useMMKV({ id: "chat_storage" })
    const [messages] = useMMKVObject<DecodedMessage[]>(`${selectedClient?.address}-${conversation?.topic}`, chatStorage)

    return messages?.sort((a, b) => b.sentNs - a.sentNs) ?? []
}
