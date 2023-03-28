import React from "react"
import { TestWrapper } from "~Test"
import { render, fireEvent, waitFor } from "@testing-library/react-native"
import { BaseButtonGroupHorizontal } from "./BaseButtonGroupHorizontal"

describe("BaseButtonGroupHorizontal", () => {
    const buttons = [
        {
            id: "1",
            label: "Button 1",
        },
        {
            id: "2",
            label: "Button 2",
        },
        {
            id: "3",
            label: "Button 3",
            icon: "star",
        },
    ]

    it("should render the correctly one button", async () => {
        const { getByText } = render(
            <BaseButtonGroupHorizontal
                action={() => {}}
                buttons={buttons}
                selectedButtonIds={[]}
            />,
            { wrapper: TestWrapper },
        )
        await waitFor(() => expect(getByText("Button 1")).toBeTruthy())
    })

    it("should call the action function when a button is pressed", async () => {
        const mockAction = jest.fn()
        const { getByText } = render(
            <BaseButtonGroupHorizontal
                action={mockAction}
                buttons={buttons}
                selectedButtonIds={["2"]}
            />,
            { wrapper: TestWrapper },
        )
        await waitFor(() => expect(getByText("Button 1")).toBeTruthy())
        const button = getByText("Button 1")
        fireEvent.press(button)
        expect(mockAction).toHaveBeenCalledWith(buttons[0])
    })

    it("should disable a disabled button", async () => {
        const mockAction = jest.fn()

        const disabledButton = {
            id: "4",
            label: "Button 4",
            disabled: true,
        }
        const { getByText } = render(
            <BaseButtonGroupHorizontal
                action={mockAction}
                buttons={[...buttons, disabledButton]}
                selectedButtonIds={[]}
            />,
            { wrapper: TestWrapper },
        )
        await waitFor(() => expect(getByText("Button 4")).toBeTruthy())
        const button = getByText("Button 4")
        fireEvent.press(button)
        expect(mockAction).not.toBeCalled()
    })
})
