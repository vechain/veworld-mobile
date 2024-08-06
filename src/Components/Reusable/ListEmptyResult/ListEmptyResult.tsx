import React from "react"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"

export type ListEmptyResultsProps = {
    onClick?: () => void
    title?: string
    subtitle: string
    icon: string
}

export const ListEmptyResults = ({ onClick, title, subtitle, icon }: ListEmptyResultsProps) => {
    const theme = useTheme()
    return (
        <BaseView justifyContent="center" alignItems="center" flex={1}>
            <BaseIcon name={icon} size={45} color={theme.colors.text} />
            <BaseSpacer height={8} />
            <BaseText mx={20} typographyFont="body" align="center">
                {subtitle}
            </BaseText>
            <BaseSpacer height={16} />
            {onClick && title && (
                <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                    <BaseButton action={onClick} title={title} haptics="Light" />
                </BaseView>
            )}
        </BaseView>
    )
}
