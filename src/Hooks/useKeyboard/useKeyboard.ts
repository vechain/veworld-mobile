import { useEffect, useState } from "react"
import { Keyboard } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTabBarBottomMargin } from "~Hooks/useTabBarBottomMargin"
import { PlatformUtils } from "~Utils"

export const useKeyboard = () => {
    const [visible, setVisible] = useState(false)
    const [bottomStyle, setBottomStyle] = useState(0)
    const insets = useSafeAreaInsets()
    const { androidOnlyTabBarBottomMargin } = useTabBarBottomMargin()

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            // keyboardWillShow event is not supported on Android
            PlatformUtils.isIOS() ? "keyboardWillShow" : "keyboardDidShow",
            keyboardEvent => {
                const keyboardHeight = keyboardEvent.endCoordinates.height - insets.bottom - insets.top
                if (!visible) {
                    setBottomStyle(
                        PlatformUtils.isIOS() ? keyboardHeight : keyboardHeight - androidOnlyTabBarBottomMargin,
                    )
                    setVisible(true)
                }
            },
        )

        const keyboardDidHideListener = Keyboard.addListener(
            // keyboardWillHide event is not supported on Android
            PlatformUtils.isIOS() ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                if (visible) {
                    setVisible(false)
                    setBottomStyle(0)
                }
            },
        )

        return () => {
            keyboardDidHideListener.remove()
            keyboardDidShowListener.remove()
        }
    }, [androidOnlyTabBarBottomMargin, insets.bottom, insets.top, visible])

    return { visible, bottomStyle }
}
