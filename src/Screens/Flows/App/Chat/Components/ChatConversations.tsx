import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { FlatList } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView, useConversations } from "~Components"
import { useTheme } from "~Hooks"
import { Routes } from "~Navigation"
import { ConversationRow } from "./ConversationRow"

type Props = {}

const ChatConversations: React.FC<Props> = () => {
    const theme = useTheme()
    // Get the client associated with the current selected address
    // Get the list of all the conversations allowed
    const { data: convs, isLoading, isFetching, isRefetching, refetch: refetchConversations } = useConversations()
    // Get list of all conversations unknown (to be added in Requests tab)

    const allowedConvs = convs?.filter(c => c.state === "allowed")
    const requestsConvs = convs?.filter(c => c.state === "unknown")

    const itemSeparator = useCallback(() => {
        return <BaseSpacer height={1} background={theme.colors.card} />
    }, [theme])

    return (
        <BaseView h={100}>
            {isLoading ? (
                <BaseText>{"Loading..."}</BaseText>
            ) : (
                <>
                    <HeaderComponent counter={requestsConvs?.length ?? 0} />

                    <NestableScrollContainer>
                        <FlatList
                            data={allowedConvs}
                            onRefresh={refetchConversations}
                            refreshing={isFetching || isRefetching}
                            keyExtractor={item => item.topic}
                            ItemSeparatorComponent={itemSeparator}
                            renderItem={({ item }) => <ConversationRow item={item} />}
                        />
                    </NestableScrollContainer>
                </>
            )}
        </BaseView>
    )
}

const HeaderComponent = ({ counter }: { counter: number }) => {
    const theme = useTheme()
    const nav = useNavigation()

    return (
        <BaseView>
            <BaseTouchable onPress={() => nav.navigate(Routes.CHAT_REQUESTS)}>
                <BaseView flexDirection="row" justifyContent="space-between" p={12} w={100}>
                    <BaseView flexDirection="row" flex={1}>
                        <BaseIcon name="tray-alert" color={"white"} />
                        <BaseText typographyFont="subSubTitle" mx={12}>
                            {"Requests"}
                        </BaseText>
                    </BaseView>
                    <BaseText
                        borderRadius={100}
                        color={theme.colors.textReversed}
                        bg={theme.colors.danger}
                        px={7}
                        py={2}>
                        {counter}
                    </BaseText>
                </BaseView>
            </BaseTouchable>
        </BaseView>
    )
}

export default ChatConversations
