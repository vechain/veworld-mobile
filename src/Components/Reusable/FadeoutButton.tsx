import { DimensionValue } from "react-native"
import React from "react"
import { BaseButton } from "~Components/Base"

type Props = {
    title: string
    action: () => void
    disabled?: boolean
    isLoading?: boolean
    _bottom?: number
    mx?: number
    _width?: DimensionValue
    testID?: string
}

export const FadeoutButton = ({
    title,
    action,
    disabled = false,
    isLoading = false,
    _bottom,
    mx,
    _width,
    testID,
}: Props) => {
    return (
        <BaseButton
            testID={testID}
            disabled={disabled}
            size="lg"
            haptics="Medium"
            w={100}
            title={title}
            action={action}
            activeOpacity={0.94}
            isLoading={isLoading}
            mx={mx}
        />
    )
}
