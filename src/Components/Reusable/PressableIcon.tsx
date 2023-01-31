import React from "react"
import { TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { useTheme } from "~Common"

type Props = {
    title: string
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

export const PressableIcon = ({
    title,
    size,
    action,
    color,
    m,
    p,
    my,
    mx,
    py,
    px,
}: Props) => {
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
            <Icon
                name={title}
                size={size}
                color={color ? color : theme.colors.button}
            />
        </TouchableOpacity>
    )
}
