import React from "react"
import { BaseSpacer, BaseSwitch, BaseText, BaseView } from "~Components"
import { typography } from "~Constants"
import { useTheme } from "~Hooks"

type Props = {
    title: string
    subtitle?: string
    onValueChange: (value: boolean) => void
    value: boolean
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
}

export const EnableFeature = ({
    title,
    subtitle,
    onValueChange,
    value,
    typographyFont = "subSubTitleMedium",
    subtitleTypographyFont = "captionRegular",
}: Props) => {
    const theme = useTheme()
    return (
        <BaseView flexDirection="row" alignItems="center">
            <BaseView flexDirection="column" flex={1} justifyContent="center">
                <BaseText typographyFont={typographyFont}>{title}</BaseText>
                {subtitle && (
                    <BaseText color={theme.colors.textLight} typographyFont={subtitleTypographyFont} mt={8}>
                        {subtitle}
                    </BaseText>
                )}
            </BaseView>
            <BaseSpacer width={20} />
            <BaseSwitch onValueChange={onValueChange} value={value} />
        </BaseView>
    )
}
