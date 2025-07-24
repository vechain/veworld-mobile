import React, { ReactNode } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { useCopyClipboard, useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AddressUtils } from "~Utils"

const HexValue = ({ value }: { value: string }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseButton
            textColor={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_600}
            variant="ghost"
            size="sm"
            px={0}
            typographyFont="captionMedium"
            title={AddressUtils.humanAddress(value)}
            action={() => onCopyToClipboard(value, LL.COMMON_LBL_ADDRESS())}
            rightIcon={
                <BaseIcon
                    name="icon-copy"
                    color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_600}
                    size={12}
                    style={styles.hexValueIcon}
                />
            }
        />
    )
}

const StringValue = ({ value }: { value: string }) => {
    const theme = useTheme()

    return (
        <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
            {value}
        </BaseText>
    )
}

const BaseAdditionalDetail = ({ label, value }: { label: string; value: ReactNode }) => {
    const theme = useTheme()
    return (
        <BaseView flexDirection="column" gap={4}>
            <BaseText typographyFont="smallCaptionMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                {label}
            </BaseText>
            {value}
        </BaseView>
    )
}

BaseAdditionalDetail.HexValue = HexValue
BaseAdditionalDetail.StringValue = StringValue

const baseStyles = () =>
    StyleSheet.create({
        hexValueIcon: {
            marginLeft: 4,
        },
    })

export { BaseAdditionalDetail }
