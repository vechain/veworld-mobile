import React from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks/useTheme"
import type { ChatMessage } from "~Hooks/useB3mo"
import { B3moToolCard } from "./B3moToolCard"

export type B3moMessageBubbleProps = {
    message: ChatMessage
    onApproveToolCall?: (toolCallId: string) => void
    onRejectToolCall?: (toolCallId: string) => void
}

export const B3moMessageBubble = ({ message, onApproveToolCall, onRejectToolCall }: B3moMessageBubbleProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const isUser = message.role === "user"

    return (
        <BaseView style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
            <BaseView style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                {message.content ? (
                    <BaseText typographyFont="body" color={isUser ? COLORS.WHITE : undefined}>
                        {message.content}
                    </BaseText>
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
