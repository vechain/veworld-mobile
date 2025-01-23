import { BaseText } from "~Components"
import React from "react"
import { useTheme } from "~Hooks"

type HeaderTitleProps = {
    title: string
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({ title }) => {
    const theme = useTheme()
    return (
        <BaseText color={theme.colors.title} typographyFont="subTitleSemiBold">
            {title}
        </BaseText>
    )
}
