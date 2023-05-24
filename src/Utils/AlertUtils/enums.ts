import { LocalizedString } from "typesafe-i18n"

export type AlertButtonStyle = "cancel" | "default" | "destructive"
export type AlertContent = {
    text?: LocalizedString
    onPress?: () => void
    style?: AlertButtonStyle
}
