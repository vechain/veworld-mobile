import React from "react"
import { useTheme } from "~Common"
import { BaseIcon, BaseText, BaseTouchableBox } from "~Components"

type Props = {
    placeholder: string
    onClick: () => void
}

export const ChangeLanguage: React.FC<Props> = ({ placeholder, onClick }) => {
    const theme = useTheme()

    return (
        <BaseTouchableBox action={onClick} justifyContent="space-between">
            <BaseText typographyFont="smallButtonPrimary">
                {placeholder}
            </BaseText>
            <BaseIcon name={"web"} color={theme.colors.text} size={24} />
        </BaseTouchableBox>
    )
}
