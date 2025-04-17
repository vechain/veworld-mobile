import React from "react"
import { render, screen, fireEvent } from "@testing-library/react-native"
import { BaseRadioButton } from "./BaseRadioButton"
import { TestWrapper } from "~Test"

const mockAction = jest.fn()

describe("BaseRadioButton", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly with default props", async () => {
        render(
            <BaseRadioButton id="1" testID="BaseRadioButton-1" label="Test" isSelected={false} onPress={mockAction} />,
            {
                wrapper: TestWrapper,
            },
        )

        const radioButton = await screen.findByTestId("BaseRadioButton-1")

        expect(radioButton).toBeOnTheScreen()
    })

    it("should render correctly with selected props", async () => {
        render(
            <BaseRadioButton id="1" testID="BaseRadioButton-1" label="Test" isSelected={true} onPress={mockAction} />,
            {
                wrapper: TestWrapper,
            },
        )

        const radioButton = await screen.findByTestId("BaseRadioButton-1")

        expect(radioButton).toBeOnTheScreen()
        expect(radioButton).toHaveAccessibilityValue("selected")
    })

    it("should render correctly with disabled props", async () => {
        render(
            <BaseRadioButton
                id="1"
                testID="BaseRadioButton-1"
                label="Test"
                isSelected={false}
                onPress={mockAction}
                disabled
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const radioButton = await screen.findByTestId("BaseRadioButton-1")

        expect(radioButton).toBeOnTheScreen()
        expect(radioButton).toBeDisabled()
    })

    it("should render correctly and call the action when pressed", async () => {
        const { rerender } = render(
            <BaseRadioButton id="1" testID="BaseRadioButton-1" label="Test" isSelected={false} onPress={mockAction} />,
            {
                wrapper: TestWrapper,
            },
        )

        const radioButton = await screen.findByTestId("BaseRadioButton-1")

        expect(radioButton).toBeOnTheScreen()

        fireEvent.press(radioButton)

        expect(mockAction).toHaveBeenCalled()

        rerender(
            <BaseRadioButton id="1" testID="BaseRadioButton-1" label="Test" isSelected={true} onPress={mockAction} />,
        )

        expect(radioButton).toHaveAccessibilityValue("selected")
    })

    it("should render correctly and not call the action when disabled", async () => {
        render(
            <BaseRadioButton
                id="1"
                testID="BaseRadioButton-1"
                label="Test"
                isSelected={false}
                disabled
                onPress={mockAction}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const radioButton = await screen.findByTestId("BaseRadioButton-1")

        expect(radioButton).toBeOnTheScreen()

        fireEvent.press(radioButton)

        expect(mockAction).not.toHaveBeenCalled()
    })
})
