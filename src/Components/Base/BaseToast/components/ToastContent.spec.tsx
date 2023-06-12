import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { ToastContent } from "./ToastContent"
import { successToastStyles } from "../util"
import { ColorTheme } from "~Constants"

const successStyles = successToastStyles(ColorTheme("light"))
const onPress = jest.fn()
const testID = "test"
const findToast = () => {
    return screen.findByTestId(testID)
}

describe("ToastContent", () => {
    it("should render correctly - no onPress", async () => {
        render(
            <ToastContent
                icon={"close"}
                styles={successStyles}
                testID={testID}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        const toast = await findToast()
        expect(toast).toBeVisible()
    })
    it("should render correctly - onPress", async () => {
        render(
            <ToastContent
                icon={"close"}
                styles={successStyles}
                onPress={onPress}
                testID={testID}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        const toast = await findToast()
        act(() => {
            fireEvent.press(toast)
        })
        expect(onPress).toHaveBeenCalled()
    })
})
