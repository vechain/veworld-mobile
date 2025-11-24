import React from "react"
import { BaseIcon } from "~Components"
import { HeaderIconButton } from "./HeaderIconButton"

type Props = {
    action: () => void
    testID?: string
}

export const CloseIconHeaderButton = ({ action, testID = "Header_Close_Icon" }: Props) => {
    return (
        <HeaderIconButton testID={testID} action={action}>
            <BaseIcon name="icon-x" size={16} />
        </HeaderIconButton>
    )
}
