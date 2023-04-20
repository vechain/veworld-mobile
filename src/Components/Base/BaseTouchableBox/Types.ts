import {
    StyleProp,
    TouchableWithoutFeedbackProps,
    ViewStyle,
} from "react-native"

export interface GenericTouchableProps extends TouchableWithoutFeedbackProps {
    onPress?: () => void
    onPressIn?: () => void
    onPressOut?: () => void
    onLongPress?: () => void
    nativeID?: string
    shouldActivateOnStart?: boolean
    disallowInterruption?: boolean
    containerStyle?: StyleProp<ViewStyle>
}
