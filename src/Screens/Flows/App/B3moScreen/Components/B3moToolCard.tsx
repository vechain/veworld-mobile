import React, { useState } from "react"
import { Linking, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import type { ToolCallView } from "~Hooks/useB3mo"

export type B3moToolCardProps = {
    toolCall: ToolCallView
}

export const B3moToolCard = ({ toolCall }: B3moToolCardProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const network = useAppSelector(selectSelectedNetwork)
    const [expanded, setExpanded] = useState(false)

    const statusLabel = (() => {
        switch (toolCall.status) {
            case "pending":
                return LL.B3MO_AGENT_TOOL_QUEUED()
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
            : theme.colors.subtitle

    const onOpenExplorer = () => {
        if (!toolCall.txId) return
        const base = network.explorerUrl ?? "https://explore.vechain.org"
        Linking.openURL(`${base}/transactions/${toolCall.txId}`)
    }

    return (
        <BaseTouchable action={() => setExpanded(p => !p)}>
            <BaseView style={styles.card}>
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
            </BaseView>
        </BaseTouchable>
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
    })
