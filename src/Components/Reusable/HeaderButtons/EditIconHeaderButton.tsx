import React from "react"
import { BaseIcon } from "~Components/Base"
import { useTheme } from "~Hooks"
import { HeaderIconButton } from "./HeaderIconButton"

type Props = {
    action: () => void
    testID?: string
}

export const EditIconHeaderButton = ({ action, testID = "Edit-HeaderIcon" }: Props) => {
    const theme = useTheme()

    return (
        <HeaderIconButton action={action}>
            <BaseIcon size={16} name="icon-editBox" color={theme.colors.text} testID={testID} />
        </HeaderIconButton>
    )
}
