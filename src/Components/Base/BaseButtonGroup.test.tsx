import React from "react"
import {
    render,
    fireEvent,
    waitFor,
    screen,
} from "@testing-library/react-native"
import { BaseButtonGroup } from "./BaseButtonGroup"
import { TestWrapper } from "~Test"

describe("BaseButtonGroup", () => {
    const buttons = [
        { id: "1", label: "Button 1" },
        { id: "2", label: "Button 2" },
        { id: "3", label: "Button 3", disabled: true },
    ]
    const selectedButtonIds = ["1"]

    it("renders all buttons", async () => {
        render(
            <BaseButtonGroup
                action={() => {}}
                buttons={buttons}
                selectedButtonIds={selectedButtonIds}
                buttonTestID={"base-button"}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        // wait for useEffects
        await waitFor(() =>
            expect(screen.getByTestId("base-button-1")).toBeTruthy(),
        )
        expect(screen.getByTestId("base-button-1")).toBeVisible()
        expect(screen.getByTestId("base-button-2")).toBeVisible()
        expect(screen.getByTestId("base-button-3")).toBeVisible()
    })

    it("calls the action function when a button is pressed", async () => {
        const mockAction = jest.fn()
        const { getByTestId } = render(
            <BaseButtonGroup
                action={mockAction}
                buttons={buttons}
                selectedButtonIds={selectedButtonIds}
                buttonTestID={"base-button"}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        // wait for useEffects
        await waitFor(() =>
            expect(screen.getByTestId("base-button-1")).toBeTruthy(),
        )
        const button = getByTestId("base-button-1")
        fireEvent.press(button)
        expect(mockAction).toHaveBeenCalled()
        expect(mockAction).toHaveBeenCalledWith(buttons[0])
    })
})
