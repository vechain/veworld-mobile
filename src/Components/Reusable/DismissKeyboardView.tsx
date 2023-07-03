import React, { ReactNode } from "react"
import {
    Keyboard,
    ViewProps,
    ScrollViewProps,
    TouchableWithoutFeedback,
} from "react-native"

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
