import React from "react"
import { BaseIcon, HeaderIconButton } from "~Components"
import { useTheme } from "~Hooks"

type Props = {
    action: () => void
    testID?: string
    rounded?: boolean
}

export const ReorderIconHeaderButton = ({ action, testID = "Reorder-HeaderIcon", rounded = false }: Props) => {
    const theme = useTheme()

    return (
        <HeaderIconButton testID={testID} action={action} rounded={rounded}>
            <BaseIcon size={16} name="icon-list-end" color={theme.colors.text} />
        </HeaderIconButton>
    )
}
