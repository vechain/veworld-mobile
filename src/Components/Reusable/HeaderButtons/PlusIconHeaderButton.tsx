import React from "react"
import { BaseIcon, HeaderIconButton } from "~Components"
import { useTheme } from "~Hooks"

type Props = {
    action: () => void
    testID?: string
}

export const PlusIconHeaderButton = ({ action, testID = "Plus-HeaderIcon" }: Props) => {
    const theme = useTheme()

    return (
        <HeaderIconButton action={action}>
            <BaseIcon size={16} name="icon-plus" color={theme.colors.text} testID={testID} />
        </HeaderIconButton>
    )
}
