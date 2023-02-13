import { Alert as RNAlert } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import * as i18n from "~i18n"

const Alert = (
    title: LocalizedString,
    message: LocalizedString,
    buttonTitle: LocalizedString,
    buttonAction: () => void,
    cancelTitle?: LocalizedString,
    cancelAction?: () => void,
    cancelButtonStyle?: "cancel" | "default" | "destructive" | undefined,
) => {
    let action = { text: buttonTitle, onPress: buttonAction }
    let cancel = {
        text: cancelTitle,
        onPress: cancelAction,
        style: cancelButtonStyle ?? "cancel",
    }

    let config: any

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

export { Alert, showCancelledFaceIdAlert }
