import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { RequireUserPassword } from "~Components"
import { ColorThemeType } from "~Constants"
import { useB3moAuth, useB3moClient, useB3moUnlock, useCheckIdentity, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { selectIsB3moSessionUnlocked } from "~Storage/Redux/Selectors/B3mo"
import { NETWORK_TYPE } from "~Model/Network/enums"
import { B3moBanner, B3moComposer, B3moMessageBubble } from "./Components"

type Nav = NativeStackNavigationProp<{
    [Routes.B3MO_HISTORY]: undefined
    [Routes.B3MO_SETTINGS]: undefined
}>

type AuthState = "idle" | "pending" | "error"

export const B3moChatScreen = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation<Nav>()
    const network = useAppSelector(selectSelectedNetwork)
    const isUnlocked = useAppSelector(selectIsB3moSessionUnlocked)
    const { messages, send, isStreaming, isLoadingTranscript, startNewSession, error } = useB3moClient()
    const { unlock } = useB3moUnlock()
    const { signIn } = useB3moAuth()
    const listRef = useRef<FlatList>(null)

    const [authState, setAuthState] = useState<AuthState>("idle")
    const [authError, setAuthError] = useState<string | undefined>()
    const autoTriggeredRef = useRef(false)

    const networkParam: "mainnet" | "testnet" = useMemo(() => {
        if (network.type === NETWORK_TYPE.TEST) return "testnet"
        return "mainnet"
    }, [network.type])

    const onIdentityConfirmed = useCallback(
        async (pin?: string) => {
            try {
                const walletKey = await unlock(pin)
                await signIn(walletKey)
                setAuthState("idle")
                setAuthError(undefined)
            } catch (e) {
                setAuthState("error")
                setAuthError(e instanceof Error ? e.message : LL.B3MO_AGENT_UNLOCK_FAIL())
            }
        },
        [unlock, signIn, LL],
    )

    const { isPasswordPromptOpen, handleClosePasswordModal, onPasswordSuccess, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed,
            onCancel: () => setAuthState("error"),
            allowAutoPassword: false,
        })

    const triggerUnlock = useCallback(async () => {
        setAuthState("pending")
        setAuthError(undefined)
        await checkIdentityBeforeOpening()
    }, [checkIdentityBeforeOpening])

    useEffect(() => {
        if (isUnlocked) {
            autoTriggeredRef.current = false
            return
        }
        if (autoTriggeredRef.current) return
        autoTriggeredRef.current = true
        void triggerUnlock()
    }, [isUnlocked, triggerUnlock])

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

    const renderEmpty = useCallback(() => {
        if (isLoadingTranscript) {
            return (
                <BaseView style={styles.empty}>
                    <ActivityIndicator color={theme.colors.primary} />
                </BaseView>
            )
        }
        return (
            <BaseView style={styles.empty}>
                <BaseIcon name="icon-bot" size={48} color={theme.colors.subtitle} />
                <BaseSpacer height={12} />
                <BaseText typographyFont="bodyMedium" align="center" color={theme.colors.subtitle}>
                    {LL.B3MO_AGENT_INTRO_BODY()}
                </BaseText>
            </BaseView>
        )
    }, [isLoadingTranscript, styles.empty, theme.colors.primary, theme.colors.subtitle, LL])

    const showAuthOverlay = !isUnlocked

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
                    ListEmptyComponent={renderEmpty}
                />

                {error ? (
                    <BaseView style={styles.errorRow}>
                        <BaseText typographyFont="captionRegular" color={theme.colors.danger}>
                            {error}
                        </BaseText>
                    </BaseView>
                ) : null}

                <B3moComposer onSend={onSend} disabled={isStreaming || !isUnlocked} />
            </KeyboardAvoidingView>

            {showAuthOverlay ? (
                <BaseView style={styles.authOverlay}>
                    {authState === "pending" ? (
                        <ActivityIndicator color={theme.colors.primary} size="large" />
                    ) : (
                        <BaseView alignItems="center" px={24}>
                            <BaseIcon name="icon-bot" size={48} color={theme.colors.primary} />
                            <BaseSpacer height={12} />
                            {authError ? (
                                <BaseText typographyFont="captionRegular" color={theme.colors.danger} align="center">
                                    {authError}
                                </BaseText>
                            ) : null}
                            <BaseSpacer height={16} />
                            <BaseButton
                                title={LL.B3MO_AGENT_UNLOCK_CTA()}
                                action={triggerUnlock}
                                testID="b3mo-unlock-retry"
                            />
                        </BaseView>
                    )}
                </BaseView>
            ) : null}

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
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
        authOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
        },
    })
