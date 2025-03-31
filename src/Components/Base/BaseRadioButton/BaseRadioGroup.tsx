import React from "react"
import { BaseRadioButton } from "./BaseRadioButton"
import { BaseView } from "../BaseView"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"

export type RadioButton = {
    id: string
    label: string
    disabled?: boolean
}

type Props = {
    buttons: RadioButton[]
    selectedId: string
    action: (button: RadioButton) => void
    isBottomSheet?: boolean
}

export const BaseRadioGroup = ({ buttons, selectedId, isBottomSheet, action }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView style={styles.container}>
            {buttons.map(button => {
                return (
                    <BaseRadioButton
                        testID={`RadioButton-${button.id}`}
                        isSelected={selectedId === button.id}
                        {...button}
                        isBottomSheet={isBottomSheet}
                        onPress={() => action(button)}
                    />
                )
            })}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            gap: 4,
        },
    })
