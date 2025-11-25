import React from "react"
import { BaseIcon } from "~Components"
import { HeaderIconButton } from "./HeaderIconButton"
import { useTheme } from "~Hooks"

type Props = {
    action: () => void
    testID?: string
    color?: string
}

export const CloseIconHeaderButton = ({ action, testID = "Header_Close_Icon", color }: Props) => {
    const theme = useTheme()
    return (
        <HeaderIconButton testID={testID} action={action}>
            <BaseIcon name="icon-x" size={16} color={color ?? theme.colors.rightIconHeaderColor} />
        </HeaderIconButton>
    )
}
