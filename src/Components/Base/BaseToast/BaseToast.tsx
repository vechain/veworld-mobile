import React from "react"
import Toast, { ToastConfigParams } from "react-native-toast-message"
import { ColorThemeType, useTheme } from "~Common"
import PlatformUtils from "~Common/Utils/PlatformUtils" // this is imported like so to avoid circular dependency
import {
    errorToastStyles,
    infoToastStyles,
    successToastStyles,
    warningToastStyles,
} from "./util"
import { ToastContent } from "./components"

/**
 * Creates a toast configuration object for the given theme.
 *
 * @param {ColorThemeType} theme - The current theme.
 * @returns {object} - The toast configuration object.
 */
export const toastConfig = (theme: ColorThemeType) => ({
    success: ({ text1, text2, props }: ToastConfigParams<any>) => {
        const styles = successToastStyles(theme)

        const { textLink, onPress } = props

        return (
            <ToastContent
                styles={styles}
                icon="check-circle-outline"
                text1={text1}
                text2={text2}
                text3={textLink}
                onPress={onPress}
                hideToast={hideToast}
            />
        )
    },

    error: ({ text1, text2, props }: ToastConfigParams<any>) => {
        const styles = errorToastStyles(theme)

        const { textLink, onPress } = props

        return (
            <ToastContent
                styles={styles}
                icon="alert-circle-outline"
                text1={text1}
                text2={text2}
                text3={textLink}
                onPress={onPress}
                hideToast={hideToast}
            />
        )
    },

    warning: ({ text1, text2, props }: ToastConfigParams<any>) => {
        const styles = warningToastStyles(theme)

        const { textLink, onPress } = props

        return (
            <ToastContent
                styles={styles}
                icon="alert-outline"
                text1={text1}
                text2={text2}
                text3={textLink}
                onPress={onPress}
                hideToast={hideToast}
            />
        )
    },

    info: ({ text1, text2, props }: ToastConfigParams<any>) => {
        const styles = infoToastStyles(theme)

        const { textLink, onPress } = props

        return (
            <ToastContent
                styles={styles}
                icon="alert-circle-outline"
                text1={text1}
                text2={text2}
                text3={textLink}
                onPress={onPress}
                hideToast={hideToast}
            />
        )
    },
})

/**
 * Default configuration parameters for the toast component.
 */
export const commonToastParams: {
    position: "top" | "bottom"
    visibilityTime: number
    autoHide: boolean
    topOffset: number
    bottomOffset: number
} = {
    position: "top",
    visibilityTime: 4000,
    autoHide: true,
    topOffset: PlatformUtils.isIOS() ? 60 : 5,
    bottomOffset: 40,
}

/**
 * BaseToast is a functional component that renders a toast component
 * with the current theme and common parameters.
 *
 * @returns {React.Element} - The toast component.
 */
export const BaseToast: React.FC = () => {
    const theme = useTheme()

    return <Toast config={toastConfig(theme)} {...commonToastParams} />
}

export const hideToast = () => {
    Toast.hide()
}

// Export utility functions to show success, error, warning, and info toasts:
// showSuccessToast, showErrorToast, showWarningToast, showInfoToast
export const showSuccessToast = (
    text1: string,
    text2?: string,
    textLink?: string,
    onPress?: () => void,
) => {
    Toast.show({
        type: "success",
        text1,
        text2,
        props: { textLink: textLink, onPress: onPress },
    })
}

export const showErrorToast = (
    text1: string,
    text2?: string,
    textLink?: string,
    onPress?: () => void,
) => {
    Toast.show({
        type: "error",
        text1,
        text2,
        props: { textLink: textLink, onPress: onPress },
    })
}

export const showWarningToast = (
    text1: string,
    text2?: string,
    textLink?: string,
    onPress?: () => void,
) => {
    Toast.show({
        type: "warning",
        text1,
        text2,
        props: { textLink: textLink, onPress: onPress },
    })
}

export const showInfoToast = (
    text1: string,
    text2?: string,
    textLink?: string,
    onPress?: () => void,
) => {
    Toast.show({
        type: "info",
        text1,
        text2,
        props: { textLink: textLink, onPress: onPress },
    })
}
