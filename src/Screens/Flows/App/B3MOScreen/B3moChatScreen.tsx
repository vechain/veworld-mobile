import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet } from "react-native"
import { BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useB3moClient, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { NETWORK_TYPE } from "~Model/Network/enums"
import { B3moBanner, B3moComposer, B3moMessageBubble } from "./Components"

type Nav = NativeStackNavigationProp<{
    [Routes.B3MO_HISTORY]: undefined
    [Routes.B3MO_SETTINGS]: undefined
}>

export const B3moChatScreen = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation<Nav>()
    const network = useAppSelector(selectSelectedNetwork)
    const { messages, send, isStreaming, startNewSession, error } = useB3moClient()
    const listRef = useRef<FlatList>(null)

    const networkParam: "mainnet" | "testnet" = useMemo(() => {
        if (network.type === NETWORK_TYPE.TEST) return "testnet"
        return "mainnet"
    }, [network.type])

    useEffect(() => {
        if (messages.length > 0) {
            listRef.current?.scrollToEnd({ animated: true })
        }
    }, [messages])

    const onSend = useCallback(
        (text: string) => {
            send(text, { network: networkParam })
        },
        [send, networkParam],
    )

    const onHistory = useCallback(() => nav.navigate(Routes.B3MO_HISTORY), [nav])
    const onSettings = useCallback(() => nav.navigate(Routes.B3MO_SETTINGS), [nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseView style={styles.header}>
                <BaseTouchable action={onHistory} testID="b3mo-open-history">
                    <BaseIcon name="icon-history" size={22} color={theme.colors.text} />
                </BaseTouchable>
                <BaseText typographyFont="bodyBold" flex={1} align="center">
                    {LL.B3MO_AGENT_TAB_TITLE()}
                </BaseText>
                <BaseTouchable action={startNewSession} testID="b3mo-new-chat">
                    <BaseIcon name="icon-edit-3" size={22} color={theme.colors.text} />
                </BaseTouchable>
                <BaseSpacer width={12} />
                <BaseTouchable action={onSettings} testID="b3mo-open-settings">
                    <BaseIcon name="icon-more-horizontal" size={22} color={theme.colors.text} />
                </BaseTouchable>
            </BaseView>

            <B3moBanner />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={80}>
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <B3moMessageBubble message={item} />}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <BaseView style={styles.empty}>
                            <BaseIcon name="icon-bot" size={48} color={theme.colors.subtitle} />
                            <BaseSpacer height={12} />
                            <BaseText typographyFont="bodyMedium" align="center" color={theme.colors.subtitle}>
                                {LL.B3MO_AGENT_INTRO_BODY()}
                            </BaseText>
                        </BaseView>
                    }
                />

                {error ? (
                    <BaseView style={styles.errorRow}>
                        <BaseText typographyFont="captionRegular" color={theme.colors.danger}>
                            {error}
                        </BaseText>
                    </BaseView>
                ) : null}

                <B3moComposer onSend={onSend} disabled={isStreaming} />
            </KeyboardAvoidingView>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        flex: { flex: 1 },
        header: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 12,
            backgroundColor: theme.colors.card,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
        },
        listContent: {
            paddingTop: 12,
            paddingBottom: 12,
            flexGrow: 1,
        },
        empty: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
        },
        errorRow: {
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
    })
