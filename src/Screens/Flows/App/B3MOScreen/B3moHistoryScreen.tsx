import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import moment from "moment"
import React, { useCallback, useEffect, useState } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView, Layout } from "~Components"
import { useB3moClient, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import type { B3moListedSession } from "~Hooks/useB3mo"

type Nav = NativeStackNavigationProp<{ [Routes.B3MO_CHAT]: undefined }>

export const B3moHistoryScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation<Nav>()
    const theme = useTheme()
    const { listSessions, loadSession, deleteSession } = useB3moClient()
    const [sessions, setSessions] = useState<B3moListedSession[]>([])

    const refresh = useCallback(async () => {
        try {
            setSessions(await listSessions())
        } catch {
            setSessions([])
        }
    }, [listSessions])

    useEffect(() => {
        refresh()
    }, [refresh])

    const onOpen = useCallback(
        async (id: string) => {
            await loadSession(id)
            nav.navigate(Routes.B3MO_CHAT)
        },
        [loadSession, nav],
    )

    return (
        <Layout
            title={LL.B3MO_AGENT_HISTORY_TITLE()}
            body={
                <FlatList
                    data={sessions}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={() => <BaseSpacer height={8} />}
                    ListEmptyComponent={
                        <BaseView pt={24} alignItems="center">
                            <BaseText typographyFont="captionMedium" color={theme.colors.subtitle}>
                                {LL.B3MO_AGENT_HISTORY_EMPTY()}
                            </BaseText>
                        </BaseView>
                    }
                    renderItem={({ item }) => (
                        <BaseTouchable action={() => onOpen(item.id)} testID={`b3mo-history-${item.id}`}>
                            <BaseView p={12} style={[styles.row, { backgroundColor: theme.colors.card }]}>
                                <BaseView flex={1}>
                                    <BaseText typographyFont="bodyBold" numberOfLines={1}>
                                        {}
                                        {item.title || "Untitled"}
                                    </BaseText>
                                    <BaseText typographyFont="captionRegular" color={theme.colors.subtitle}>
                                        {}
                                        {`${moment(item.updatedAt).fromNow()} • ${item.messageCount}`}
                                    </BaseText>
                                </BaseView>
                                <BaseTouchable action={() => deleteSession(item.id).then(refresh)}>
                                    <BaseIcon name="icon-trash-2" size={18} color={theme.colors.danger} />
                                </BaseTouchable>
                            </BaseView>
                        </BaseTouchable>
                    )}
                />
            }
        />
    )
}

const styles = StyleSheet.create({
    row: {
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
    },
})
