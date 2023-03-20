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

const showGoToSettingsCameraAlert = (
    cancelAction: () => void,
    buttonAction: () => void,
) => {
    const locale = i18n.detectLocale()
    let title = i18n.i18n()[locale].TITLE_ALERT_CAMERA_PERMISSION()
    let msg = i18n.i18n()[locale].SB_ALERT_CAMERA_PERMISSION()
    let cancel = i18n.i18n()[locale].COMMON_BTN_CANCEL()
    let ok = i18n.i18n()[locale].BTN_GO_TO_SETTINGS()

    Alert(title, msg, ok, buttonAction, cancel, cancelAction, "destructive")
}

const showDefaultAlert = (
    title: LocalizedString,
    msg: LocalizedString,
    button: LocalizedString,
) => {
    const buttonAction = () => {}
    Alert(title, msg, button, buttonAction)
}

export {
    Alert,
    showCancelledFaceIdAlert,
    showGoToSettingsCameraAlert,
    showDefaultAlert,
}
