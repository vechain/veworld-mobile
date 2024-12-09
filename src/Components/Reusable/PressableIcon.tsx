import React from "react"
import { TouchableOpacity } from "react-native"
import { useTheme } from "~Hooks"
import { Icon, IconKey } from "~Components"

type Props = {
    title: IconKey
    action: () => void
    size: number
    color?: string
    m?: number
    mx?: number
    my?: number
    p?: number
    px?: number
    py?: number
}

export const PressableIcon = ({ title, size, action, color, m, p, my, mx, py, px }: Props) => {
    const theme = useTheme()

    return (
        <TouchableOpacity
            onPress={action}
            style={{
                margin: m,
                marginVertical: my,
                marginHorizontal: mx,
                padding: p,
                paddingVertical: py,
                paddingHorizontal: px,
            }}>
            <Icon name={title} size={size} color={color ? color : theme.colors.primary} />
        </TouchableOpacity>
    )
}
