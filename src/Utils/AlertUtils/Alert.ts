import { Alert as RNAlert, Linking } from "react-native"
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

const showCancelledFaceIdAlert = (
    cancelAction: () => void,
    buttonAction: () => void,
) => {
    const locale = i18n.detectLocale()
    let title = i18n.i18n()[locale].TITLE_ALERT_FACE_ID_CANCELLED()
    let msg = i18n.i18n()[locale].BD_ALERT_FACE_ID_CANCELLED()
    let retry = i18n.i18n()[locale].COMMON_BTN_RETRY()
    let signOut = i18n.i18n()[locale].COMMON_BTN_SIGN_OUT()

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

const showUnauthorizedBluetoothAlert = (cancelAction?: () => void) => {
    const locale = i18n.detectLocale()
    const title = i18n.i18n()[locale].ALERT_TITLE_AUTHORIZE_BLUETOOTH()
    const msg = i18n.i18n()[locale].ALERT_MSG_AUTHORIZE_BLUETOOTH()
    const cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()
    const ok = i18n.i18n()[locale].BTN_GO_TO_SETTINGS()

    const buttonAction = () => Linking.openSettings()

    Alert(title, msg, ok, buttonAction, cancel, cancelAction, "destructive")
}

const showDisabledBluetoothAlert = (cancelAction?: () => void) => {
    const locale = i18n.detectLocale()
    const title = i18n.i18n()[locale].ALERT_TITLE_ENABLE_BLUETOOTH()
    const msg = i18n.i18n()[locale].ALERT_MSG_ENABLE_BLUETOOTH()
    const cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()
    const ok = i18n.i18n()[locale].BTN_GO_TO_SETTINGS()

    const buttonAction = () => Linking.openSettings()

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
    showCancelledFaceIdAlert,
    showGoToSettingsAlert,
    showDefaultAlert,
    showUnauthorizedBluetoothAlert,
    showDisabledBluetoothAlert,
}
