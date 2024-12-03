import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { DecodedMessage } from "@xmtp/react-native-sdk"
import React, { useCallback, useState } from "react"
import { FlatList, Keyboard, StyleSheet } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import {
    AccountIcon,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    Layout,
    useConversation,
    useMessages,
} from "~Components"
import { useTabBarBottomMargin, useThemedStyles } from "~Hooks"
import { RootStackParamListHome, Routes } from "~Navigation"
import { humanAddress } from "~Utils/AddressUtils/AddressUtils"
import MessageBubble from "./Components/MessageBubble"
import { error, info } from "~Utils"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.CHAT_CONVERSATION>

const ConversationScreen = ({ route, navigation }: Props) => {
    const { recipient, topic } = route.params
    const [message, setMessage] = useState("")

    const { styles, theme } = useThemedStyles(baseStyles)
    const { androidOnlyTabBarBottomMargin } = useTabBarBottomMargin()

    const messages = useMessages({ topic })
    const { data: conversation } = useConversation({ topic })

    const onGoBack = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const onSendMessage = useCallback(async () => {
        if (!conversation) {
            error("VE_CHAT", "Cannot send message, no coversation found")
            return
        }
        Keyboard.dismiss()
        await conversation.send(message)
        // refetchMessages()
        setMessage("")
    }, [conversation, message])

    const separatorComponent = useCallback(() => {
        return <BaseSpacer height={6} />
    }, [])

    const messageItem = useCallback(
        ({ item, index }: { item: DecodedMessage; index: number }) => {
            info("VE_CHAT", "ITEM", item.contentTypeId)
            if (item.contentTypeId === "xmtp.org/group_updated:1.0") return <></>
            return <MessageBubble item={item} index={index} recipient={recipient} />
        },
        [recipient],
    )

    return (
        <Layout
            hasTopSafeAreaOnly
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
                <BaseView flex={1}>
                    <NestableScrollContainer style={[styles.reversedView]}>
                        <BaseView style={[styles.reversedView, styles.insetView]}>
                            <FlatList
                                data={messages}
                                inverted
                                keyExtractor={i => i.id}
                                renderItem={messageItem}
                                ItemSeparatorComponent={separatorComponent}
                            />
                        </BaseView>
                    </NestableScrollContainer>
                </BaseView>
            }
            footer={
                <BaseView mb={androidOnlyTabBarBottomMargin} flex={0}>
                    <BaseSpacer height={2} background={theme.colors.card} />
                    <BaseView w={100} flexDirection="row" p={12}>
                        {/* TODO: Implement sending token flows */}
                        <BaseIcon name="currency-usd" color={theme.colors.text} bg={theme.colors.card} />
                        <BaseView flex={1} mx={6}>
                            <BaseTextInput
                                value={message}
                                setValue={s => setMessage(s)}
                                placeholder={"Message..."}
                                inputMode="text"
                                style={styles.smallTextInput}
                            />
                        </BaseView>
                        {message && (
                            <BaseIcon
                                name={"send"}
                                bg={theme.colors.primaryLight}
                                color={theme.colors.textReversed}
                                action={() => onSendMessage()}
                            />
                        )}
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
        reversedView: {
            transform: [{ scaleY: -1 }],
        },
        insetView: {
            paddingVertical: 10,
        },
        smallTextInput: { paddingVertical: 8 },
        messagesContainer: {},
    })
