import React, { useMemo } from "react"
import { Linking, StyleSheet } from "react-native"
import Markdown from "react-native-markdown-display"
import { BaseSpacer, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks/useTheme"
import type { ChatMessage } from "~Hooks/useB3mo"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import FontUtils from "~Utils/FontUtils"
import { B3moToolCard } from "./B3moToolCard"

export type B3moMessageBubbleProps = {
    message: ChatMessage
    onApproveToolCall?: (toolCallId: string) => void
    onRejectToolCall?: (toolCallId: string) => void
}

const onLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {})
    return false
}

export const B3moMessageBubble = ({ message, onApproveToolCall, onRejectToolCall }: B3moMessageBubbleProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const isUser = message.role === "user"

    const markdownStyles = useMemo(() => {
        const textColor = isUser ? COLORS.WHITE : theme.colors.text
        const linkColor = isUser ? COLORS.WHITE : theme.colors.primary
        const codeBg = isUser ? "rgba(255,255,255,0.15)" : theme.colors.background
        return {
            body: { color: textColor, fontFamily: "Rubik", fontSize: FontUtils.font(14) },
            paragraph: { marginTop: 0, marginBottom: 0, color: textColor },
            text: { color: textColor },
            link: { color: linkColor, textDecorationLine: "underline" as const },
            code_inline: {
                backgroundColor: codeBg,
                color: textColor,
                paddingHorizontal: 4,
                borderRadius: 4,
                fontFamily: isAndroid() ? "monospace" : "Menlo",
            },
            code_block: {
                backgroundColor: codeBg,
                color: textColor,
                padding: 8,
                borderRadius: 6,
                fontFamily: isAndroid() ? "monospace" : "Menlo",
            },
            fence: {
                backgroundColor: codeBg,
                color: textColor,
                padding: 8,
                borderRadius: 6,
                fontFamily: isAndroid() ? "monospace" : "Menlo",
            },
            bullet_list: { marginVertical: 4 },
            ordered_list: { marginVertical: 4 },
            heading1: { color: textColor, fontSize: FontUtils.font(18), fontWeight: "600" as const },
            heading2: { color: textColor, fontSize: FontUtils.font(16), fontWeight: "600" as const },
            heading3: { color: textColor, fontSize: FontUtils.font(15), fontWeight: "600" as const },
            ...(isAndroid() ? {} : { strong: { fontWeight: "600" as const, color: textColor } }),
            em: { fontStyle: "italic" as const, color: textColor },
            blockquote: {
                backgroundColor: codeBg,
                borderLeftColor: linkColor,
                borderLeftWidth: 3,
                paddingHorizontal: 8,
                paddingVertical: 4,
            },
        }
    }, [isUser, theme.colors.background, theme.colors.primary, theme.colors.text])

    return (
        <BaseView style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
            <BaseView style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                {message.content ? (
                    <Markdown style={markdownStyles} onLinkPress={onLinkPress}>
                        {message.content}
                    </Markdown>
                ) : null}
                {message.role === "assistant" && message.toolCalls.length > 0 && (
                    <>
                        {message.content ? <BaseSpacer height={8} /> : null}
                        {message.toolCalls.map(tc => (
                            <B3moToolCard
                                key={tc.id}
                                toolCall={tc}
                                onApprove={onApproveToolCall}
                                onReject={onRejectToolCall}
                            />
                        ))}
                    </>
                )}
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        row: {
            paddingHorizontal: 12,
            paddingVertical: 4,
        },
        userRow: { alignItems: "flex-end" },
        assistantRow: { alignItems: "flex-start" },
        bubble: {
            maxWidth: "92%",
            padding: 12,
            borderRadius: 14,
        },
        userBubble: {
            backgroundColor: theme.colors.primary,
        },
        assistantBubble: {
            backgroundColor: theme.colors.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
        },
    })
