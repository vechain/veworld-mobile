import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useCopyClipboard, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AddressUtils } from "~Utils"

type Props = {
    address: string
    lenghtBefore?: number
    lenghtAfter?: number
}

export const CopyToClipboardAddress: React.FC<Props> = ({ address, lenghtBefore = 8, lenghtAfter = 6 }) => {
    const { onCopyToClipboard } = useCopyClipboard()
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseTouchable
            action={() => onCopyToClipboard(address, LL.COMMON_LBL_ADDRESS())}
            haptics="Light"
            style={styles.addressValue}>
            <BaseText typographyFont="bodyMedium" style={styles.addressValueLabel}>
                {AddressUtils.humanAddress(address, lenghtBefore, lenghtAfter)}
            </BaseText>
            <BaseIcon name="content-copy" size={14} color={theme.colors.primary} />
        </BaseTouchable>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        addressValue: {
            flexDirection: "row",
            width: "auto",
            padding: 0,
            margin: 0,
        },
        addressValueLabel: {
            color: theme.colors.primary,
            fontWeight: "600",
            marginRight: 4,
        },
    })
