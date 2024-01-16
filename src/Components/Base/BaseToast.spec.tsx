import {
    hideToast,
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    showWarningToast,
} from "./BaseToast"
import Toast from "react-native-toast-message"

jest.mock("react-native-toast-message", () => ({
    show: jest.fn(),
    hide: jest.fn(),
}))

// we're not able to test baseToast directly for some reasons, but it's already defined in testWrapper
describe("BaseToast", () => {
    it("showHideToast should call hide", () => {
        hideToast()
        expect(Toast.hide).toHaveBeenCalled()
    })

    it("showSuccessToast should call show with the correct params", () => {
        const text1 = "test"
        const text2 = "test2"
        showSuccessToast(text1, text2)
        expect(Toast.show).toHaveBeenCalledWith({
            type: "success",
            text1: text1,
            text2: text2,
        })

        showSuccessToast(text1)
        expect(Toast.show).toHaveBeenCalledWith({
            type: "success",
            text1: text1,
            text2: undefined,
        })
    })

    it("showErrorToast should call show with the correct params", () => {
        const text1 = "test"
        const text2 = "test2"
        showErrorToast(text1, text2)
        expect(Toast.show).toHaveBeenCalledWith({
            type: "error",
            text1: text1,
            text2: text2,
        })

        showErrorToast(text1)
        expect(Toast.show).toHaveBeenCalledWith({
            type: "error",
            text1: text1,
            text2: undefined,
        })
    })

    it("showWarningToast should call show with the correct params", () => {
        const text1 = "test"
        const text2 = "test2"
        showWarningToast(text1, text2)
        expect(Toast.show).toHaveBeenCalledWith({
            type: "warning",
            text1: text1,
            text2: text2,
        })

        showWarningToast(text1)
        expect(Toast.show).toHaveBeenCalledWith({
            type: "warning",
            text1: text1,
            text2: undefined,
        })
    })

    it("showInfoToast should call show with the correct params", () => {
        const text1 = "test"
        const text2 = "test2"
        showInfoToast(text1, text2)
        expect(Toast.show).toHaveBeenCalledWith({
            type: "info",
            text1: text1,
            text2: text2,
        })

        showInfoToast(text1)
        expect(Toast.show).toHaveBeenCalledWith({
            type: "info",
            text1: text1,
            text2: undefined,
        })
    })
})
