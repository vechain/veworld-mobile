import React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { BaseRadioGroup } from "./BaseRadioGroup"
import { TestWrapper } from "~Test"

const buttons = [
    {
        id: "1",
        label: "Button 1",
        testID: "button-1",
    },
    {
        id: "2",
        label: "Button 2",
        testID: "button-2",
    },
]

const mockAction = jest.fn()

describe("BaseRadioGroup", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly with the first one selected", () => {
        render(<BaseRadioGroup buttons={buttons} selectedId={"1"} action={mockAction} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("button-1")).toBeOnTheScreen()
        expect(screen.getByTestId("button-2")).toBeOnTheScreen()

        expect(screen.getByTestId("button-1")).toHaveAccessibilityValue("selected")
        expect(screen.getByTestId("button-2")).toHaveAccessibilityValue("not selected")
    })

    it("should render correctly with the second one selected", () => {
        const { rerender } = render(<BaseRadioGroup buttons={buttons} selectedId={"1"} action={mockAction} />, {
            wrapper: TestWrapper,
        })

        // Simulate user clicking the first button
        fireEvent.press(screen.getByTestId("button-2"))
        expect(mockAction).toHaveBeenCalledWith(buttons[1])

        // Rerender with the new selectedId to simulate the parent component updating the state
        rerender(<BaseRadioGroup buttons={buttons} selectedId={"2"} action={mockAction} />)

        expect(screen.getByTestId("button-1")).toBeOnTheScreen()
        expect(screen.getByTestId("button-2")).toBeOnTheScreen()

        expect(screen.getByTestId("button-1")).toHaveAccessibilityValue("not selected")
        expect(screen.getByTestId("button-2")).toHaveAccessibilityValue("selected")
    })

    it("should render correctly with the third one disabled", () => {
        const newButtons = [
            ...buttons,
            {
                id: "3",
                label: "Button 3",
                testID: "button-3",
                disabled: true,
            },
        ]
        render(<BaseRadioGroup buttons={newButtons} selectedId={"1"} action={mockAction} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("button-1")).toBeOnTheScreen()
        expect(screen.getByTestId("button-2")).toBeOnTheScreen()
        expect(screen.getByTestId("button-3")).toBeOnTheScreen()

        expect(screen.getByTestId("button-1")).toHaveAccessibilityValue("selected")
        expect(screen.getByTestId("button-2")).toHaveAccessibilityValue("not selected")
        expect(screen.getByTestId("button-3")).toBeDisabled()
    })

    it("should render correctly and not call the action when the third one is disabled", () => {
        const newButtons = [
            ...buttons,
            {
                id: "3",
                label: "Button 3",
                testID: "button-3",
                disabled: true,
            },
        ]
        const { rerender } = render(<BaseRadioGroup buttons={newButtons} selectedId={"1"} action={mockAction} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("button-1")).toBeOnTheScreen()
        expect(screen.getByTestId("button-2")).toBeOnTheScreen()
        expect(screen.getByTestId("button-3")).toBeOnTheScreen()

        // Simulate user clicking the disabled button
        fireEvent.press(screen.getByTestId("button-3"))

        // Action should not be called for disabled buttons
        expect(mockAction).not.toHaveBeenCalled()

        // Now click a non-disabled button
        fireEvent.press(screen.getByTestId("button-2"))
        expect(mockAction).toHaveBeenCalledWith(buttons[1])

        // Rerender with the new selectedId to simulate the parent component updating the state
        rerender(<BaseRadioGroup buttons={newButtons} selectedId={"2"} action={mockAction} />)

        expect(screen.getByTestId("button-1")).toHaveAccessibilityValue("not selected")
        expect(screen.getByTestId("button-2")).toHaveAccessibilityValue("selected")
        expect(screen.getByTestId("button-3")).toBeDisabled()
    })
})
