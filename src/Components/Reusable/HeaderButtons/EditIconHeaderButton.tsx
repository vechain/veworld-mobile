import React from "react"
import { BaseIcon, HeaderIconButton } from "~Components"
import { useTheme } from "~Hooks"

type Props = {
    action: () => void
    testID?: string
}

export const EditIconHeaderButton = ({ action, testID = "Edit-HeaderIcon" }: Props) => {
    const theme = useTheme()

    return (
        <HeaderIconButton testID={testID} action={action}>
            <BaseIcon size={16} name="icon-editBox" color={theme.colors.text} />
        </HeaderIconButton>
    )
}
