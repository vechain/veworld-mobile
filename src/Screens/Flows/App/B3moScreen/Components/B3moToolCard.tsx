import React, { useState } from "react"
import { Linking, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import type { ToolCallView } from "~Hooks/useB3mo"

export type B3moToolCardProps = {
    toolCall: ToolCallView
    onApprove?: (toolCallId: string) => void
    onReject?: (toolCallId: string) => void
}

export const B3moToolCard = ({ toolCall, onApprove, onReject }: B3moToolCardProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const network = useAppSelector(selectSelectedNetwork)
    const [expanded, setExpanded] = useState(false)

    const statusLabel = (() => {
        switch (toolCall.status) {
            case "pending":
                return LL.B3MO_AGENT_TOOL_QUEUED()
            case "awaiting_approval":
                return LL.B3MO_AGENT_TOOL_AWAITING_APPROVAL()
            case "executing":
                return LL.B3MO_AGENT_TOOL_BROADCASTING()
            case "success":
                return LL.B3MO_AGENT_TOOL_MINED()
            case "failed":
                return LL.B3MO_AGENT_TOOL_FAILED()
        }
    })()

    const statusColor =
        toolCall.status === "failed"
            ? theme.colors.danger
            : toolCall.status === "success"
            ? theme.colors.success
            : toolCall.status === "awaiting_approval"
            ? theme.colors.warning
            : theme.colors.subtitle

    const onOpenExplorer = () => {
        if (!toolCall.txId) return
        const base = network.explorerUrl ?? "https://explore.vechain.org"
        Linking.openURL(`${base}/transactions/${toolCall.txId}`)
    }

    const isAwaitingApproval = toolCall.status === "awaiting_approval"

    return (
        <BaseView style={[styles.card, isAwaitingApproval && styles.cardAwaiting]}>
            <BaseTouchable action={() => setExpanded(p => !p)}>
                <BaseView flexDirection="row" alignItems="center">
                    <BaseIcon name="icon-zap" size={16} color={theme.colors.primary} />
                    <BaseSpacer width={8} />
                    <BaseText typographyFont="bodyBold" flex={1} numberOfLines={1}>
                        {toolCall.summary ?? toolCall.name}
                    </BaseText>
                    <BaseText typographyFont="captionMedium" color={statusColor}>
                        {statusLabel}
                    </BaseText>
                </BaseView>

                {expanded && (
                    <>
                        <BaseSpacer height={8} />
                        <BaseText typographyFont="captionRegular">{toolCall.name}</BaseText>
                        {toolCall.args ? (
                            <BaseText typographyFont="captionRegular" color={theme.colors.subtitle}>
                                {JSON.stringify(toolCall.args, null, 2)}
                            </BaseText>
                        ) : null}
                        {toolCall.error && (
                            <BaseText typographyFont="captionRegular" color={theme.colors.danger}>
                                {toolCall.error}
                            </BaseText>
                        )}
                        {toolCall.txId && (
                            <BaseTouchable action={onOpenExplorer}>
                                <BaseText typographyFont="captionMedium" color={theme.colors.primary}>
                                    {LL.B3MO_AGENT_TOOL_VIEW_EXPLORER()}: {toolCall.txId.slice(0, 10)}…
                                </BaseText>
                            </BaseTouchable>
                        )}
                    </>
                )}
            </BaseTouchable>

            {isAwaitingApproval && (onApprove || onReject) ? (
                <BaseView style={styles.actionsRow}>
                    {onReject ? (
                        <BaseButton
                            flex={1}
                            variant="outline"
                            title={LL.B3MO_AGENT_TOOL_REJECT()}
                            action={() => onReject(toolCall.id)}
                            testID={`b3mo-tool-reject-${toolCall.id}`}
                        />
                    ) : null}
                    {onApprove ? (
                        <BaseButton
                            flex={1}
                            title={LL.B3MO_AGENT_TOOL_APPROVE()}
                            action={() => onApprove(toolCall.id)}
                            testID={`b3mo-tool-approve-${toolCall.id}`}
                        />
                    ) : null}
                </BaseView>
            ) : null}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.colors.card,
            padding: 10,
            marginVertical: 6,
            borderRadius: 10,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
        },
        cardAwaiting: {
            borderColor: theme.colors.warning,
            borderWidth: 1,
        },
        actionsRow: {
            flexDirection: "row",
            gap: 8,
            marginTop: 10,
        },
    })
