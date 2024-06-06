import { useEffect, useState } from "react"
import { Keyboard } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const useKeyboard = () => {
    const [visible, setVisible] = useState(false)
    const [bottomStyle, setBottomStyle] = useState(0)
    const insets = useSafeAreaInsets()

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardWillShow", keyboardEvent => {
            const keyboardHeight = keyboardEvent.endCoordinates.height - insets.bottom - insets.top
            if (!visible) {
                setBottomStyle(keyboardHeight)
                setVisible(true)
            }
        })

        const keyboardDidHideListener = Keyboard.addListener("keyboardWillHide", () => {
            if (visible) {
                setVisible(false)
                setBottomStyle(0)
            }
        })

        return () => {
            keyboardDidHideListener.remove()
            keyboardDidShowListener.remove()
        }
    }, [insets.bottom, insets.top, visible])

    return { visible, bottomStyle }
}
