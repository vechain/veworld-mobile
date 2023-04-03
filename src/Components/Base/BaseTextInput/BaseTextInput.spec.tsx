import { TestWrapper } from "~Test"
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react-native"
import { BaseTextInput } from "./BaseTextInput"

const mandatoryProps = {
    placeholder: "placeholder",
}

const customPlaceholder = "CustomPlaceholder"
const customErrorMessage = "Custom error message"
const customValue = "Custom value"

const findTextInput = async (placeholder = mandatoryProps.placeholder) =>
    await screen.findByPlaceholderText(placeholder, {}, { timeout: 5000 })

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

        const errorMessage = await screen.findByText(customErrorMessage)
        expect(errorMessage).toBeVisible()
    })
})
