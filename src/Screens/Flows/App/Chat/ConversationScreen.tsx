import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { DecodedMessage } from "@xmtp/react-native-sdk"
import React, { useCallback, useState } from "react"
import { FlatList, StyleSheet } from "react-native"
import {
    AccountIcon,
    BaseIcon,
    BaseScrollView,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    Layout,
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
    const { data: messages } = useMessages({ topic })
    // const { data: conversation } = useConversation({ topic })

    const onGoBack = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const messageItem = ({ item }: { item: DecodedMessage }) => {
        return (
            <BaseView
                flexDirection="row"
                w={100}
                px={12}
                py={6}
                justifyContent={item.senderAddress !== selectedClient?.address ? "flex-start" : "flex-end"}>
                <BaseView>
                    <BaseText typographyFont="captionBold">{humanAddress(recipient)}</BaseText>
                    <BaseText>{item.content()} </BaseText>
                    <BaseView flexDirection="row" justifyContent="flex-end">
                        <BaseText>{new Date(item.sentNs / 1000000).toISOString()}</BaseText>
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
                <BaseScrollView h={100}>
                    <FlatList
                        data={messages}
                        inverted
                        initialScrollIndex={message?.length}
                        keyExtractor={i => i.id}
                        renderItem={messageItem}
                        ItemSeparatorComponent={() => <BaseSpacer height={6} />}
                    />
                </BaseScrollView>
            }
            footer={
                <BaseView>
                    <BaseSpacer height={2} background={theme.colors.card} />
                    <BaseView w={100} flexDirection="row" p={12}>
                        <BaseView flex={1} mx={6}>
                            <BaseTextInput value={message} onChange={e => setMessage(e.nativeEvent.text)} />
                        </BaseView>
                        <BaseIcon name={"send"} bg={theme.colors.primaryLight} />
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
