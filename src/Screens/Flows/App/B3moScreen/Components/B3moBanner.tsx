import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useCopyClipboard, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectAccounts, useAppSelector } from "~Storage/Redux"
import { selectB3moLinkedAddress } from "~Storage/Redux/Selectors/B3mo"
import { AddressUtils } from "~Utils"

export const B3moBanner = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const linkedAddress = useAppSelector(selectB3moLinkedAddress)
    const accounts = useAppSelector(selectAccounts)
    const account = linkedAddress
        ? accounts.find(a => a.address.toLowerCase() === linkedAddress.toLowerCase())
        : undefined

    const { onCopyToClipboard } = useCopyClipboard()
    const onCopy = useCallback(() => {
        if (!linkedAddress) return
        onCopyToClipboard(linkedAddress, LL.B3MO_AGENT_BANNER_COPIED())
    }, [linkedAddress, onCopyToClipboard, LL])

    if (!linkedAddress) return null
    return (
        <BaseView style={styles.container}>
            <BaseIcon name="icon-bot" size={20} color={theme.colors.primary} />
            <BaseSpacer width={8} />
            <BaseView flex={1}>
                <BaseText typographyFont="bodyBold" numberOfLines={1}>
                    {account?.alias ?? "B3MO"}
                </BaseText>
                <BaseTouchable action={onCopy} style={styles.addressRow}>
                    <BaseText typographyFont="captionMedium" color={theme.colors.subtitle}>
                        {AddressUtils.humanAddress(linkedAddress, 6, 6)}
                    </BaseText>
                    <BaseSpacer width={6} />
                    <BaseIcon name="icon-copy" size={14} color={theme.colors.subtitle} />
                </BaseTouchable>
            </BaseView>
            <BaseSpacer width={8} />
            <BaseView style={styles.warningPill}>
                <BaseText typographyFont="captionRegular" color={COLORS.WHITE}>
                    {LL.B3MO_AGENT_BANNER_TITLE()}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: theme.colors.card,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
        },
        warningPill: {
            backgroundColor: theme.colors.danger,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            maxWidth: 140,
        },
        addressRow: {
            flexDirection: "row",
            alignItems: "center",
        },
    })
