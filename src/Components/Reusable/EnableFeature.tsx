import React from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseSwitch, BaseText, BaseView } from "~Components"
import { typography } from "~Constants"
import { useTheme } from "~Hooks"

type Props = {
    title: string
    subtitle?: string
    onValueChange: (value: boolean) => void
    value: boolean
    color?: string
    /**
     * Typography font for the title
     * @default subSubTitleMedium
     */
    typographyFont?: keyof typeof typography.defaults
    /**
     * Typography font for the subtitle
     * @default captionRegular
     */
    subtitleTypographyFont?: keyof typeof typography.defaults
    disabled?: boolean
}

export const EnableFeature = ({
    title,
    subtitle,
    onValueChange,
    value,
    color,
    typographyFont = "subSubTitleMedium",
    subtitleTypographyFont = "captionRegular",
    disabled,
}: Props) => {
    const theme = useTheme()
    const labelColor = color ?? theme.colors.textLight
    return (
        <BaseView flexDirection="row" alignItems="center" style={styles.container}>
            <BaseView flexDirection="column" flex={1} justifyContent="center">
                <BaseText typographyFont={typographyFont} color={labelColor} pb={4} pt={4}>
                    {title}
                </BaseText>
                {subtitle && (
                    <BaseText color={labelColor} typographyFont={subtitleTypographyFont} mt={8}>
                        {subtitle}
                    </BaseText>
                )}
            </BaseView>
            <BaseSpacer width={20} />
            <BaseSwitch onValueChange={onValueChange} value={value} disabled={disabled} />
        </BaseView>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: 32,
    },
})
