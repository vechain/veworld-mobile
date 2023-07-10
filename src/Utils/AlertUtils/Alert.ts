import { Alert as RNAlert } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import * as i18n from "~i18n"
import { AlertButtonStyle, AlertContent } from "./enums"

const Alert = (
    title: LocalizedString,
    message: LocalizedString,
    buttonTitle: LocalizedString,
    buttonAction: () => void,
    cancelTitle?: LocalizedString,
    cancelAction?: () => void,
    cancelButtonStyle?: AlertButtonStyle | undefined,
) => {
    let action = { text: buttonTitle, onPress: buttonAction }
    let cancel = {
        text: cancelTitle,
        onPress: cancelAction,
        style: cancelButtonStyle ?? "cancel",
    }

    let config: AlertContent[]

    if (cancelTitle) {
        config = [cancel, action]
    } else {
        config = [action]
    }

    RNAlert.alert(title, message, config)
}

const showCancelledBiometricsAlert = (
    cancelAction: () => void,
    buttonAction: () => void,
) => {
    const locale = i18n.detectLocale()
    let title = i18n.i18n()[locale].TITLE_ALERT_BIOMETRICS_CANCELLED()
    let msg = i18n.i18n()[locale].BD_ALERT_BIOMETRICS_CANCELLED()
    let retry = i18n.i18n()[locale].COMMON_BTN_RETRY()
    let signOut = i18n.i18n()[locale].COMMON_BTN_RESET()

    Alert(title, msg, retry, buttonAction, signOut, cancelAction, "destructive")
}

const showGoToSettingsAlert = (
    title: LocalizedString,
    msg: LocalizedString,
    cancelAction: () => void,
    buttonAction: () => void,
) => {
    const locale = i18n.detectLocale()
    let cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()
    let ok = i18n.i18n()[locale].BTN_GO_TO_SETTINGS()

    Alert(title, msg, ok, buttonAction, cancel, cancelAction, "destructive")
}

const showDefaultAlert = (
    title: LocalizedString,
    msg: LocalizedString,
    button: LocalizedString,
    buttonAction?: () => void,
) => {
    let action = buttonAction ? buttonAction : () => {}
    Alert(title, msg, button, action)
}

export {
    Alert,
    showCancelledBiometricsAlert,
    showGoToSettingsAlert,
    showDefaultAlert,
}
