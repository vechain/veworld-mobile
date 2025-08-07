import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import { BaseIcon, HeaderIconButton } from "~Components"
import { useTheme } from "~Hooks"

type Props = {
    action: () => void
    testID?: string
    rounded?: boolean
    circled?: boolean
    style?: StyleProp<ViewStyle>
}

export const ReorderIconHeaderButton = ({
    action,
    testID = "Reorder-HeaderIcon",
    rounded = false,
    circled = false,
    style,
}: Props) => {
    const theme = useTheme()

    return (
        <HeaderIconButton testID={testID} action={action} rounded={rounded} circled={circled} style={style}>
            <BaseIcon size={16} name="icon-list-end" color={theme.colors.text} />
        </HeaderIconButton>
    )
}
