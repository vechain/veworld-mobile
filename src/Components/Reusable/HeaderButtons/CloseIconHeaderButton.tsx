import React from "react"
import { BaseIcon } from "~Components"
import { HeaderIconButton } from "./HeaderIconButton"
import { useTheme } from "~Hooks"

type Props = {
    action: () => void
    testID?: string
}

export const CloseIconHeaderButton = ({ action, testID = "Header_Close_Icon" }: Props) => {
    const theme = useTheme()
    return (
        <HeaderIconButton testID={testID} action={action}>
            <BaseIcon name="icon-x" size={16} color={theme.colors.sendBottomSheet.iconColor} />
        </HeaderIconButton>
    )
}
