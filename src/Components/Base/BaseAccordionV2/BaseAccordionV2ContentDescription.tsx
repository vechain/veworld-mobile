import React from "react"
import { BaseText, BaseTextProps } from "~Components"
import { useTheme } from "~Hooks"

export const BaseAccordionV2ContentDescription = ({ children, ...props }: BaseTextProps) => {
    const theme = useTheme()

    return (
        <BaseText typographyFont="caption" color={theme.colors.editSpeedBs.subtitle} pb={8} {...props}>
            {children}
        </BaseText>
    )
}
