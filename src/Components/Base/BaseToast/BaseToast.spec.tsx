import { act } from "@testing-library/react-native"
import {
    hideToast,
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    showWarningToast,
    toastConfig,
} from "./BaseToast"
import Toast from "react-native-toast-message"
import { ColorTheme, ColorThemeType } from "~Constants"

jest.mock("react-native-toast-message", () => ({
    show: jest.fn(),
    hide: jest.fn(),
    config: jest.fn(),
}))

describe("BaseToast", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("calls showSuccessToast with correct parameters", () => {
        const text1 = "Success"
        const text2 = "Details"
        const textLink = "Click here"
        const onPress = jest.fn()

        showSuccessToast(text1, text2, textLink, onPress)

        expect(Toast.show).toHaveBeenCalledWith({
            type: "success",
            text1,
            text2,
            props: { textLink, onPress, visibilityTime: 10000 },
        })
    })

    it("calls showErrorToast with correct parameters", () => {
        const text1 = "Error"
        const text2 = "Details"
        const textLink = "Click here"
        const onPress = jest.fn()

        showErrorToast(text1, text2, textLink, onPress)

        expect(Toast.show).toHaveBeenCalledWith({
            type: "error",
            text1,
            text2,
            props: { textLink, onPress, visibilityTime: 10000 },
        })
    })

    it("calls showWarningToast with correct parameters", () => {
        const text1 = "Warning"
        const text2 = "Details"
        const textLink = "Click here"
        const onPress = jest.fn()

        showWarningToast(text1, text2, textLink, onPress)

        expect(Toast.show).toHaveBeenCalledWith({
            type: "warning",
            text1,
            text2,
            props: { textLink, onPress, visibilityTime: 10000 },
        })
    })

    it("calls showInfoToast with correct parameters", () => {
        const text1 = "Info"
        const text2 = "Details"
        const textLink = "Click here"
        const onPress = jest.fn()

        showInfoToast(text1, text2, textLink, onPress)

        expect(Toast.show).toHaveBeenCalledWith({
            type: "info",
            text1,
            text2,
            props: { textLink, onPress, visibilityTime: 10000 },
        })
    })

    it("triggers onPress for textLink when provided for showSuccessToast", () => {
        const text1 = "Success"
        const text2 = "Details"
        const textLink = "Click here"
        const onPress = jest.fn()

        showSuccessToast(text1, text2, textLink, onPress)

        const configParams = (Toast.show as jest.Mock).mock.calls[0][0]
        const { props } = configParams

        act(() => {
            // Simulate the onPress event
            props.onPress()
        })

        // Check if the onPress event has been called
        expect(onPress).toHaveBeenCalled()
    })

    it("triggers onPress for textLink when provided for showErrorToast", () => {
        const text1 = "Success"
        const text2 = "Details"
        const textLink = "Click here"
        const onPress = jest.fn()

        showErrorToast(text1, text2, textLink, onPress)

        const configParams = (Toast.show as jest.Mock).mock.calls[0][0]
        const { props } = configParams

        act(() => {
            // Simulate the onPress event
            props.onPress()
        })

        // Check if the onPress event has been called
        expect(onPress).toHaveBeenCalled()
    })

    it("triggers onPress for textLink when provided for showWarningToast", () => {
        const text1 = "Success"
        const text2 = "Details"
        const textLink = "Click here"
        const onPress = jest.fn()

        showWarningToast(text1, text2, textLink, onPress)

        const configParams = (Toast.show as jest.Mock).mock.calls[0][0]
        const { props } = configParams

        act(() => {
            // Simulate the onPress event
            props.onPress()
        })

        // Check if the onPress event has been called
        expect(onPress).toHaveBeenCalled()
    })

    it("triggers onPress for textLink when provided for showInfoToast", () => {
        const text1 = "Success"
        const text2 = "Details"
        const textLink = "Click here"
        const onPress = jest.fn()

        showInfoToast(text1, text2, textLink, onPress)

        const configParams = (Toast.show as jest.Mock).mock.calls[0][0]
        const { props } = configParams

        act(() => {
            // Simulate the onPress event
            props.onPress()
        })

        // Check if the onPress event has been called
        expect(onPress).toHaveBeenCalled()
    })
})

describe("toastConfig", () => {
    it("returns the correct configuration for error toast", () => {
        const theme: ColorThemeType = ColorTheme("light")
        const config = toastConfig(theme)

        const result = config.error({
            text1: "Error",
            text2: "Details",
            props: { textLink: "Click here", onPress: jest.fn() },
            isVisible: true,
            hide: jest.fn(),
            position: "top",
            show: jest.fn(),
            onPress: jest.fn(),
            type: "error",
        })

        expect(result.props.icon).toBe("alert-circle-outline")
        expect(result.props.text1).toBe("Error")
        expect(result.props.text2).toBe("Details")
        expect(result.props.text3).toBe("Click here")
    })

    it("returns the correct configuration for success toast", () => {
        const theme: ColorThemeType = ColorTheme("light")
        const config = toastConfig(theme)

        const result = config.success({
            text1: "Success",
            text2: "Details",
            props: { textLink: "Click here", onPress: jest.fn() },
            isVisible: true,
            hide: jest.fn(),
            position: "top",
            show: jest.fn(),
            onPress: jest.fn(),
            type: "success",
        })

        expect(result.props.icon).toBe("check-circle-outline")
        expect(result.props.text1).toBe("Success")
        expect(result.props.text2).toBe("Details")
        expect(result.props.text3).toBe("Click here")
    })

    it("returns the correct configuration for warning toast", () => {
        const theme: ColorThemeType = ColorTheme("light")
        const config = toastConfig(theme)

        const result = config.warning({
            text1: "Warning",
            text2: "Details",
            props: { textLink: "Click here", onPress: jest.fn() },
            isVisible: true,
            hide: jest.fn(),
            position: "top",
            show: jest.fn(),
            onPress: jest.fn(),
            type: "warning",
        })

        expect(result.props.icon).toBe("alert-outline")
        expect(result.props.text1).toBe("Warning")
        expect(result.props.text2).toBe("Details")
        expect(result.props.text3).toBe("Click here")
    })

    it("returns the correct configuration for info toast", () => {
        const theme: ColorThemeType = ColorTheme("light")
        const config = toastConfig(theme)

        const result = config.info({
            text1: "Info",
            text2: "Details",
            props: { textLink: "Click here", onPress: jest.fn() },
            isVisible: true,
            hide: jest.fn(),
            position: "top",
            show: jest.fn(),
            onPress: jest.fn(),
            type: "info",
        })

        expect(result.props.icon).toBe("alert-circle-outline")
        expect(result.props.text1).toBe("Info")
        expect(result.props.text2).toBe("Details")
        expect(result.props.text3).toBe("Click here")
    })
})

describe("hideToast", () => {
    it("calls Toast.hide()", () => {
        showSuccessToast("Success")

        act(() => {
            // Wait for the toast to be displayed
            jest.runAllTimers()
        })

        hideToast()

        expect(Toast.hide).toHaveBeenCalled()
    })
})
