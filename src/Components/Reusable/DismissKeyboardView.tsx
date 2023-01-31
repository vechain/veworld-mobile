import React, { ReactNode } from "react"
import { TouchableWithoutFeedback, Keyboard, View } from "react-native"

type Props = {
    grow?: number
    children: ReactNode
}

const DismissKeyboardHOC = (Comp: any) => {
    return ({ children, ...props }: Props) => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Comp {...props} style={{ flexGrow: props.grow }}>
                {children}
            </Comp>
        </TouchableWithoutFeedback>
    )
}

export const DismissKeyboardView = DismissKeyboardHOC(View)
