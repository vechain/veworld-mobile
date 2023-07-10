import { Alert as RNAlert } from "react-native"
import { AlertButtonStyle } from "./enums"
import {
    Alert,
    showCancelledBiometricsAlert,
    showGoToSettingsAlert,
    showDefaultAlert,
} from "./Alert"
import { LocalizedString } from "typesafe-i18n"

jest.mock("react-native", () => ({
    Alert: {
        alert: jest.fn(),
    },
}))

describe("Alert", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should display an alert with one button if cancelTitle is not provided", () => {
        const title = "Alert Title"
        const message = "Alert Message"
        const buttonTitle = "OK"
        const buttonAction = jest.fn()

        Alert(
            title as LocalizedString,
            message as LocalizedString,
            buttonTitle as LocalizedString,
            buttonAction,
        )

        expect(RNAlert.alert).toHaveBeenCalledWith(
            title,
            message,
            expect.arrayContaining([
                { text: buttonTitle, onPress: buttonAction },
            ]),
        )
    })

    it("should display an alert with two buttons if cancelTitle is provided", () => {
        const title = "Alert Title"
        const message = "Alert Message"
        const buttonTitle = "OK"
        const buttonAction = jest.fn()
        const cancelTitle = "Cancel"
        const cancelAction = jest.fn()
        const cancelButtonStyle: AlertButtonStyle = "cancel"

        Alert(
            title as LocalizedString,
            message as LocalizedString,
            buttonTitle as LocalizedString,
            buttonAction,
            cancelTitle as LocalizedString,
            cancelAction,
            cancelButtonStyle,
        )

        expect(RNAlert.alert).toHaveBeenCalledWith(
            title,
            message,
            expect.arrayContaining([
                {
                    text: cancelTitle,
                    onPress: cancelAction,
                    style: cancelButtonStyle,
                },
                { text: buttonTitle, onPress: buttonAction },
            ]),
        )
    })
})

describe("showCancelledFaceIdAlert", () => {
    it("should show an alert for cancelled Face ID authentication", () => {
        const cancelAction = jest.fn()
        const buttonAction = jest.fn()
        showCancelledBiometricsAlert(cancelAction, buttonAction)
        expect(RNAlert.alert).toHaveBeenCalled()
    })
})

describe("showGoToSettingsAlert", () => {
    it("should show an alert for going to camera settings", () => {
        const cancelAction = jest.fn()
        const buttonAction = jest.fn()
        const title = "Alert Title"
        const message = "Alert Message"
        showGoToSettingsAlert(
            title as LocalizedString,
            message as LocalizedString,
            cancelAction,
            buttonAction,
        )
        expect(RNAlert.alert).toHaveBeenCalled()
    })
})

describe("showDefaultAlert", () => {
    it("should show the default alert - no action", () => {
        const title = "Alert Title"
        const message = "Alert Message"
        const buttonTitle = "OK"
        showDefaultAlert(
            title as LocalizedString,
            message as LocalizedString,
            buttonTitle as LocalizedString,
        )
        expect(RNAlert.alert).toHaveBeenCalled()
    })
    it("should show the default alert - action", () => {
        const title = "Alert Title"
        const message = "Alert Message"
        const buttonTitle = "OK"
        const buttonAction = jest.fn()
        showDefaultAlert(
            title as LocalizedString,
            message as LocalizedString,
            buttonTitle as LocalizedString,
            buttonAction,
        )
        expect(RNAlert.alert).toHaveBeenCalled()
    })
})
