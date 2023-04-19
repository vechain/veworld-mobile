import { useEffect, useState } from "react"
import { Keyboard } from "react-native"

export const useKeyboard = (
    onChange?: (visible: boolean) => void,
): { visible: boolean } => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            "keyboardDidShow",
            () => {
                setVisible(true)
                onChange?.(true)
            },
        )
        const keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            () => {
                setVisible(false)
                onChange?.(false)
            },
        )

        return () => {
            keyboardDidHideListener.remove()
            keyboardDidShowListener.remove()
        }
    }, [onChange])

    return { visible }
}
