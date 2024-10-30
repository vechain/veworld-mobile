import React from "react"
import { BaseSpacer, BaseSwitch, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"

type Props = {
    title: string
    subtitle?: string
    onValueChange: (value: boolean) => void
    value: boolean
}

export const EnableFeature = ({ title, subtitle, onValueChange, value }: Props) => {
    const theme = useTheme()
    return (
        <BaseView flexDirection="row" alignItems="center">
            <BaseView flexDirection="column" flex={1}>
                <BaseText typographyFont="subSubTitleMedium" my={8}>
                    {title}
                </BaseText>
                {subtitle && (
                    <BaseText color={theme.colors.textLight} typographyFont="captionRegular">
                        {subtitle}
                    </BaseText>
                )}
            </BaseView>
            <BaseSpacer width={20} />
            <BaseSwitch onValueChange={onValueChange} value={value} />
        </BaseView>
    )
}
