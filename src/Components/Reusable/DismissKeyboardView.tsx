import React, { ReactNode } from "react"
// A native button around the whole screen would compete with its inputs; a missed dismiss is harmless.
// eslint-disable-next-line no-restricted-imports
import { Keyboard, ViewProps, ScrollViewProps, TouchableWithoutFeedback } from "react-native"

type Props = {
    children: ReactNode
} & ViewProps &
    ScrollViewProps

export const DismissKeyboardView = ({ children }: Props) => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            {children}
        </TouchableWithoutFeedback>
    )
}
