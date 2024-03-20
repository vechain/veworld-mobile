import { StyleSheet } from "react-native"
import React from "react"
import { SCREEN_WIDTH } from "~Constants"
import { BaseButton, BaseView } from "~Components/Base"

type Props = {
    title: string
    action: () => void
    disabled?: boolean
    isLoading?: boolean
    testID?: string
}

export const FadeoutButton = ({ title, action, disabled = false, isLoading = false, testID }: Props) => {
    return (
        <BaseView style={baseStyles.container} accessible={false}>
            <BaseButton
                accessible
                testID={testID}
                disabled={disabled}
                size="lg"
                haptics="Medium"
                w={100}
                title={title}
                action={action}
                activeOpacity={0.94}
                isLoading={isLoading}
            />
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        position: "absolute",
        width: SCREEN_WIDTH - 40,
        bottom: 24,
    },
})
