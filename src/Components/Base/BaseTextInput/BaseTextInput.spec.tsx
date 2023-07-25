import { TestWrapper } from "~Test"
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react-native"
import { BaseTextInput } from "./BaseTextInput"

const mandatoryProps = {
    placeholder: "placeholder",
}

jest.mock("expo-haptics", () => {
    return {
        NotificationFeedbackType: {
            Success: 0,
            Warning: 1,
            Error: 2,
        },
        ImpactFeedbackStyle: {
            Light: 0,
            Medium: 1,
            Heavy: 2,
        },
        notificationAsync: jest.fn(),
        impactAsync: jest.fn(),
    }
})

const customPlaceholder = "CustomPlaceholder"
const customErrorMessage = "Custom error message"
const customValue = "Custom value"
const customLabel = "Custom label"

const findTextInput = async (placeholder = mandatoryProps.placeholder) =>
    await screen.findByPlaceholderText(placeholder, {}, { timeout: 5000 })

const findErrorMessage = async (errorMessage = customErrorMessage) =>
    await screen.findByText(errorMessage, {}, { timeout: 5000 })

const findLabel = async (label = customLabel) =>
    await screen.findByText(label, {}, { timeout: 5000 })

describe("BaseTextInput", () => {
    it("renders correctly with mandatory props", async () => {
        render(<BaseTextInput {...mandatoryProps} />, {
            wrapper: TestWrapper,
        })

        const textInput = await findTextInput()
        expect(textInput).toBeVisible()
    })

    it("renders correctly with custom props", async () => {
        render(
            <BaseTextInput
                placeholder={customPlaceholder}
                errorMessage={customErrorMessage}
                value={customValue}
                setValue={() => {}}
            />,
            { wrapper: TestWrapper },
        )

        const textInput = await findTextInput(customPlaceholder)
        expect(textInput).toBeVisible()

        const errorMessage = screen.getByText(customErrorMessage)
        expect(errorMessage).toBeVisible()
    })

    it("updates value correctly", async () => {
        const mockSetValue = jest.fn()

        render(
            <BaseTextInput
                {...mandatoryProps}
                value={customValue}
                setValue={mockSetValue}
            />,
            { wrapper: TestWrapper },
        )

        const textInput = await findTextInput()
        expect(textInput.props.value).toEqual(customValue)

        const newValue = "New value"
        fireEvent.changeText(textInput, newValue)

        expect(mockSetValue).toHaveBeenCalledTimes(1)
        expect(mockSetValue).toHaveBeenCalledWith(newValue)
    })

    it("renders error message correctly", async () => {
        render(
            <BaseTextInput
                {...mandatoryProps}
                errorMessage={customErrorMessage}
            />,
            { wrapper: TestWrapper },
        )

        const errorMessage = await findErrorMessage()
        expect(errorMessage).toBeVisible()
    })

    it("renders the correct value prop", async () => {
        const value = "Initial value"

        render(
            <BaseTextInput
                {...mandatoryProps}
                value={value}
                setValue={() => {}}
            />,
            { wrapper: TestWrapper },
        )

        const textInput = await findTextInput()
        expect(textInput.props.value).toEqual(value)
    })

    it("calls setValue prop on input change", async () => {
        const mockSetValue = jest.fn()

        render(<BaseTextInput {...mandatoryProps} setValue={mockSetValue} />, {
            wrapper: TestWrapper,
        })

        const textInput = await findTextInput()
        const newValue = "New value"
        fireEvent.changeText(textInput, newValue)

        expect(mockSetValue).toHaveBeenCalledTimes(1)
        expect(mockSetValue).toHaveBeenCalledWith(newValue)
    })

    it("renders error message when errorMessage prop is provided", async () => {
        render(
            <BaseTextInput
                {...mandatoryProps}
                errorMessage={customErrorMessage}
            />,
            { wrapper: TestWrapper },
        )

        const errorMessage = await findErrorMessage()
        expect(errorMessage).toBeVisible()
    })

    it("renders label correctly when label prop is provided", async () => {
        render(<BaseTextInput {...mandatoryProps} label={customLabel} />, {
            wrapper: TestWrapper,
        })

        const label = await findLabel()
        expect(label).toBeVisible()
    })

    it("renders rightIcon correctly when rightIcon prop is provided", async () => {
        const rightIconName = "qrcode-scan"
        const rightIconTestID = "right-icon-test-id"

        render(
            <BaseTextInput
                {...mandatoryProps}
                rightIcon={rightIconName}
                rightIconTestID={rightIconTestID}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const rightIcon = await screen.findByTestId(rightIconTestID)
        expect(rightIcon).toBeVisible()
    })

    it("calls onIconPress prop when rightIcon is pressed", async () => {
        const rightIconName = "qrcode-scan"
        const rightIconTestID = "right-icon-test-id"
        const mockOnIconPress = jest.fn()

        render(
            <BaseTextInput
                {...mandatoryProps}
                rightIcon={rightIconName}
                onIconPress={mockOnIconPress}
                rightIconTestID={rightIconTestID}
            />,
            { wrapper: TestWrapper },
        )

        const rightIcon = await screen.findByTestId(rightIconTestID)
        fireEvent.press(rightIcon)

        expect(mockOnIconPress).toHaveBeenCalledTimes(1)
    })
})
