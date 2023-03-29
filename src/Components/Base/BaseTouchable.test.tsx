import { TestWrapper } from "~Test"
import React from "react"
import { render, fireEvent, waitFor } from "@testing-library/react-native"
import { BaseTouchable } from "./BaseTouchable"

describe("BaseTouchable", () => {
    it("renders correctly with title", async () => {
        const title = "Touch me"
        const onPress = jest.fn()
        const { getByText } = render(
            <BaseTouchable title={title} action={onPress} />,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(getByText(title)).toBeTruthy())

        expect(getByText(title)).toBeDefined()
    })

    it("calls action when pressed", async () => {
        const onPress = jest.fn()
        const { getByText } = render(
            <BaseTouchable title="Touch me" underlined action={onPress} />,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(getByText("Touch me")).toBeTruthy())
        fireEvent.press(getByText("Touch me"))

        expect(onPress).toHaveBeenCalled()
    })
})
