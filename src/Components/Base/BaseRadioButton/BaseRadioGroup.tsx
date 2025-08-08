import React, { ComponentProps } from "react"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { BaseView } from "../BaseView"
import { BaseRadioButton } from "./BaseRadioButton"

export type RadioButton<TId extends string = string> = {
    id: TId
    label: string
    disabled?: boolean
}

type Props<TRadioButtons extends RadioButton<any>[]> = {
    buttons: TRadioButtons
    selectedId: string
    action: (button: TRadioButtons[number]) => void
} & Pick<ComponentProps<typeof BaseRadioButton>, "isBottomSheet" | "dot">

export const BaseRadioGroup = <TRadioButtons extends RadioButton<any>[]>({
    buttons,
    selectedId,
    isBottomSheet,
    action,
    dot = "right",
}: Props<TRadioButtons>) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView style={styles.container}>
            {buttons.map(button => {
                return (
                    <BaseRadioButton
                        key={button.id}
                        testID={`RadioButton-${button.id}`}
                        isSelected={selectedId === button.id}
                        {...button}
                        isBottomSheet={isBottomSheet}
                        dot={dot}
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
