import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { DecodedMessage } from "@xmtp/react-native-sdk"
import React, { useCallback, useState } from "react"
import { FlatList, RefreshControl, StyleSheet } from "react-native"
import {
    AccountIcon,
    BaseIcon,
    BaseScrollView,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    Layout,
    useConversation,
    useMessages,
    useVeChat,
} from "~Components"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListHome, Routes } from "~Navigation"
import { humanAddress } from "~Utils/AddressUtils/AddressUtils"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.CHAT_CONVERSATION>

const ConversationScreen = ({ route, navigation }: Props) => {
    const { recipient, topic } = route.params
    const [message, setMessage] = useState("")

    const { styles, theme } = useThemedStyles(baseStyles)

    const { selectedClient } = useVeChat()
    const {
        data: messages,
        refetch: refetchMessages,
        isRefetching: isMsgRefetching,
        isFetching: isMsgFetching,
    } = useMessages({ topic })
    const { data: conversation } = useConversation({ topic })

    const onGoBack = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const onSendMessage = useCallback(async () => {
        if (!conversation) return
        await conversation.send(message)
        refetchMessages()
        setMessage("")
    }, [conversation, message, refetchMessages])

    const humanDate = useCallback((timestamp: number) => {
        const date = new Date(timestamp)
        const hours = date.getHours()
        const mins = date.getMinutes()
        return `${hours}:${mins}`
    }, [])

    const messageItem = ({ item }: { item: DecodedMessage }) => {
        const isSender = item.senderAddress === selectedClient?.inboxId
        return (
            <BaseView flexDirection="row" w={100} px={12} py={6} justifyContent={!isSender ? "flex-start" : "flex-end"}>
                <BaseView p={12} bg={!isSender ? theme.colors.card : theme.colors.primary}>
                    <BaseText
                        typographyFont="captionBold"
                        color={!isSender ? theme.colors.text : theme.colors.textReversed}>
                        {!isSender ? humanAddress(recipient) : humanAddress(selectedClient.address)}
                    </BaseText>
                    <BaseText color={!isSender ? theme.colors.text : theme.colors.textReversed}>
                        {item.content()}{" "}
                    </BaseText>
                    <BaseView flexDirection="row" justifyContent="flex-end">
                        <BaseText color={!isSender ? theme.colors.text : theme.colors.textReversed}>
                            {humanDate(item.sentNs / 1000000)}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseView>
        )
    }

    return (
        <Layout
            noMargin
            noBackButton
            fixedHeader={
                <BaseView flexDirection="row" px={20} pb={8} style={styles.titleContainer}>
                    <BaseIcon haptics="Light" action={onGoBack} name="arrow-left" size={24} color={theme.colors.text} />

                    <BaseView flexDirection="row" flex={1} pr={10} alignItems="center">
                        <AccountIcon address={recipient} size={24} />
                        <BaseText typographyFont="subTitleBold" mx={8}>
                            {humanAddress(recipient, 4, 6)}
                        </BaseText>
                    </BaseView>
                </BaseView>
            }
            fixedBody={
                <BaseScrollView
                    h={100}
                    style={{ transform: [{ scaleY: -1 }] }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isMsgRefetching || isMsgFetching}
                            onRefresh={refetchMessages}
                            tintColor={theme.colors.border}
                        />
                    }>
                    <BaseView style={{ transform: [{ scaleY: -1 }] }}>
                        <FlatList
                            data={messages}
                            inverted
                            initialScrollIndex={message?.length}
                            keyExtractor={i => i.id}
                            renderItem={messageItem}
                            ItemSeparatorComponent={() => <BaseSpacer height={6} />}
                        />
                    </BaseView>
                </BaseScrollView>
            }
            footer={
                <BaseView>
                    <BaseSpacer height={2} background={theme.colors.card} />
                    <BaseView w={100} flexDirection="row" p={12}>
                        <BaseView flex={1} mx={6}>
                            <BaseTextInput value={message} setValue={s => setMessage(s)} placeholder={"Message..."} />
                        </BaseView>
                        <BaseIcon
                            name={"send"}
                            bg={theme.colors.primaryLight}
                            color={theme.colors.textReversed}
                            disabled={!message}
                            action={() => onSendMessage()}
                        />
                    </BaseView>
                </BaseView>
            }
        />
    )
}

export default ConversationScreen

const baseStyles = () =>
    StyleSheet.create({
        titleContainer: {
            gap: 16,
        },
    })
