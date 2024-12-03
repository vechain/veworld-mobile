import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { FlatList } from "react-native"
import { BaseSpacer, BaseView, Layout, useConversations } from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { ConversationRow } from "./Components/ConversationRow"
import { useTheme } from "~Hooks"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.CHAT_REQUESTS>

const RequestsScreen: React.FC<Props> = () => {
    const theme = useTheme()
    const { data, refetch, isFetching, isRefetching } = useConversations()

    const requests = useMemo(() => {
        return data?.filter(conversation => conversation.state === "unknown")
    }, [data])

    const itemSeparator = useCallback(() => {
        return <BaseSpacer height={1} background={theme.colors.card} />
    }, [theme])

    const onConversationStateChange = useCallback(() => {
        refetch()
    }, [refetch])

    return (
        <Layout
            noMargin
            body={
                <BaseView h={100}>
                    <FlatList
                        data={requests}
                        refreshing={isFetching || isRefetching}
                        onRefresh={refetch}
                        keyExtractor={item => item.topic}
                        renderItem={({ item }) => (
                            <ConversationRow
                                item={item}
                                swipeEnabled={true}
                                onAllow={onConversationStateChange}
                                onDeny={onConversationStateChange}
                            />
                        )}
                        ItemSeparatorComponent={itemSeparator}
                    />
                </BaseView>
            }
        />
    )
}

export default RequestsScreen
