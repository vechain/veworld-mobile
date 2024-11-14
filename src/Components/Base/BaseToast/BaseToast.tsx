import React from "react"
import Toast, { ToastConfigParams } from "react-native-toast-message"
import { ColorThemeType } from "~Constants"
import { useTheme } from "~Hooks"
import PlatformUtils from "~Utils/PlatformUtils"
import { errorToastStyles, infoToastStyles, successToastStyles, warningToastStyles } from "./util"
import { ToastContent } from "./components"
import HapticsService from "~Services/HapticsService"

const IS_CI_BUILD = process.env.IS_CI_BUILD_ENABLED === "true"

export type ToastAddress = {
    sender: string
    recipient?: string
}

/**
 * Creates a toast configuration object for the given theme.
 *
 * @param {ColorThemeType} theme - The current theme.
 * @returns {object} - The toast configuration object.
 */
export const toastConfig = (theme: ColorThemeType) => ({
    success: ({ text1, text2, props }: ToastConfigParams<any>) => {
        const styles = successToastStyles(theme)

        const { textLink, onPress, testID, addresses } = props

        return (
            <ToastContent
                styles={styles}
                icon="check-circle-outline"
                addresses={addresses}
                text1={text1}
                text2={text2}
                text3={textLink}
                onPress={onPress}
                hideToast={hideToast}
                testID={testID}
            />
        )
    },

    error: ({ text1, text2, props }: ToastConfigParams<any>) => {
        const styles = errorToastStyles(theme)

        const { textLink, onPress, testID, addresses } = props

        return (
            <ToastContent
                styles={styles}
                icon="alert-outline"
                addresses={addresses}
                text1={text1}
                text2={text2}
                text3={textLink}
                onPress={onPress}
                hideToast={hideToast}
                testID={testID}
            />
        )
    },

    warning: ({ text1, text2, props }: ToastConfigParams<any>) => {
        const styles = warningToastStyles(theme)

        const { textLink, onPress, testID, addresses } = props

        return (
            <ToastContent
                styles={styles}
                icon="alert-outline"
                addresses={addresses}
                text1={text1}
                text2={text2}
                text3={textLink}
                onPress={onPress}
                hideToast={hideToast}
                testID={testID}
            />
        )
    },

    info: ({ text1, text2, props }: ToastConfigParams<any>) => {
        const styles = infoToastStyles(theme)

        const { textLink, onPress, testID, addresses } = props

        return (
            <ToastContent
                styles={styles}
                icon="alert-circle-outline"
                addresses={addresses}
                text1={text1}
                text2={text2}
                text3={textLink}
                onPress={onPress}
                hideToast={hideToast}
                testID={testID}
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

type CustomToastConfig = {
    text1: string
    text2?: string
    textLink?: string
    addresses?: ToastAddress
    visibilityTime?: number
    testID?: string
    onPress?: () => void
}

/**
 * BaseToast is a functional component that renders a toast component
 * with the current theme and common parameters.
 *
 * @returns {React.Element} - The toast component.
 */
export const BaseToast: React.FC = () => {
    const theme = useTheme()

    // Disable toast notification for CI build
    // Tests with maestro become unreliable with them active
    if (IS_CI_BUILD) return <></>

    return <Toast config={toastConfig(theme)} {...commonToastParams} />
}

export const hideToast = () => {
    Toast.hide()
}

// Export utility functions to show success, error, warning, and info toasts:
// showSuccessToast, showErrorToast, showWarningToast, showInfoToast
export const showSuccessToast = ({
    addresses,
    text1,
    text2,
    textLink,
    visibilityTime,
    testID,
    onPress,
}: CustomToastConfig) => {
    Toast.show({
        type: "success",
        text1,
        text2,
        visibilityTime: visibilityTime ?? commonToastParams.visibilityTime,
        props: { textLink, onPress, testID, addresses },
    })
}

export const showErrorToast = ({
    addresses,
    text1,
    text2,
    textLink,
    visibilityTime,
    testID,
    onPress,
}: CustomToastConfig) => {
    HapticsService.triggerNotification({ level: "Error" })
    Toast.show({
        type: "error",
        text1,
        text2,
        visibilityTime: visibilityTime ?? commonToastParams.visibilityTime,
        props: { textLink, onPress, testID, addresses },
    })
}

export const showWarningToast = ({
    addresses,
    text1,
    text2,
    textLink,
    visibilityTime,
    testID,
    onPress,
}: CustomToastConfig) => {
    Toast.show({
        type: "warning",
        text1,
        text2,
        visibilityTime: visibilityTime ?? commonToastParams.visibilityTime,
        props: { textLink, onPress, testID, addresses },
    })
}

export const showInfoToast = ({
    addresses,
    text1,
    text2,
    textLink,
    visibilityTime,
    testID,
    onPress,
}: CustomToastConfig) => {
    Toast.show({
        type: "info",
        text1,
        text2,
        visibilityTime: visibilityTime ?? commonToastParams.visibilityTime,
        props: { textLink, onPress, testID, addresses },
    })
}

export enum ToastType {
    Success = "success",
    Error = "error",
    Warning = "warning",
    Info = "info",
}
