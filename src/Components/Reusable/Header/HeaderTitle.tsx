import { BaseText } from "~Components"
import React from "react"
import { useTheme } from "~Hooks"

type HeaderTitleProps = {
    title: string
    testID?: string
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({ title, testID }) => {
    const theme = useTheme()
    return (
        <BaseText testID={testID} color={theme.colors.title} typographyFont="subTitleSemiBold">
            {title}
        </BaseText>
    )
}
