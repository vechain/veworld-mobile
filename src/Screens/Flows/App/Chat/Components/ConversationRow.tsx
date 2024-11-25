import { useNavigation } from "@react-navigation/native"
import { Conversation } from "@xmtp/react-native-sdk"
import React, { useCallback, useEffect, useState } from "react"
import { AccountIcon, BaseButton, BaseText, BaseTouchable, BaseView, useVeChat } from "~Components"
import { Routes } from "~Navigation"
import { humanAddress } from "~Utils/AddressUtils/AddressUtils"

interface Props {
    item: Conversation
}

export const ConversationRow: React.FC<Props> = ({ item }) => {
    const nav = useNavigation()
    const { selectedClient } = useVeChat()
    const [recipientAddr, setRecipientAddr] = useState("")

    const getRecipientAddr = useCallback(async () => {
        const members = await item.members()
        const recipient = members.find(m => m.addresses[0] !== selectedClient?.address)
        if (recipient) {
            setRecipientAddr(recipient.addresses[0])
        }
    }, [item, selectedClient?.address])

    const goToConversation = () => {
        nav.navigate(Routes.CHAT_CONVERSATION, { recipient: recipientAddr, topic: item.topic })
    }

    useEffect(() => {
        getRecipientAddr()
    }, [getRecipientAddr])

    return (
        <BaseTouchable onPress={goToConversation}>
            <BaseView flexDirection="row" p={12} justifyContent="space-between">
                <BaseView flexDirection="row">
                    <AccountIcon address={recipientAddr} size={36} />
                    <BaseView h={100} flexDirection="column" alignItems="flex-start">
                        <BaseText mx={12} typographyFont="subSubTitleMedium">
                            {humanAddress(recipientAddr)}
                        </BaseText>
                    </BaseView>
                </BaseView>
                {item.state === "unknown" && (
                    <BaseView flexDirection="row">
                        <BaseButton variant="outline" action={() => {}} size="md">
                            {"Allow"}
                        </BaseButton>
                        <BaseButton variant="ghost" action={() => {}} size="md">
                            {"Deny"}
                        </BaseButton>
                    </BaseView>
                )}
            </BaseView>
        </BaseTouchable>
    )
}
