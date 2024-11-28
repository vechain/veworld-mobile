import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { FlatList } from "react-native"
import { BaseSpacer, BaseView, Layout, useConversations } from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { ConversationRow } from "./Components/ConversationRow"
import { useTheme } from "~Hooks"
import { NestableScrollContainer } from "react-native-draggable-flatlist"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.CHAT_REQUESTS>

const RequestsScreen: React.FC<Props> = () => {
    const theme = useTheme()
    const { data, refetch, isFetching, isRefetching } = useConversations()

    const requests = useMemo(() => {
        return data?.filter(req => req.state === "unknown")
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
            fixedBody={
                <BaseView h={100}>
                    <NestableScrollContainer>
                        <FlatList
                            data={requests}
                            refreshing={isFetching || isRefetching}
                            onRefresh={refetch}
                            keyExtractor={item => item.topic}
                            renderItem={({ item }) => (
                                <ConversationRow
                                    item={item}
                                    swipeEnabled={false}
                                    onAllow={onConversationStateChange}
                                    onDeny={onConversationStateChange}
                                />
                            )}
                            ItemSeparatorComponent={itemSeparator}
                        />
                    </NestableScrollContainer>
                </BaseView>
            }
        />
    )
}

export default RequestsScreen
