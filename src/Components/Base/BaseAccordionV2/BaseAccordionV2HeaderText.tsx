import React from "react"
import { BaseText, BaseTextProps } from "~Components"

export const BaseAccordionV2HeaderText = ({ children, ...props }: BaseTextProps) => {
    return (
        <BaseText typographyFont="button" {...props}>
            {children}
        </BaseText>
    )
}
