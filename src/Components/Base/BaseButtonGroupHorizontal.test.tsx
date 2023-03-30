import React from "react"
import { TestWrapper } from "~Test"
import { render, fireEvent, screen } from "@testing-library/react-native"
import { BaseButtonGroupHorizontal } from "./BaseButtonGroupHorizontal"
const buttons: {
    id: string
    label: string
    icon?: string
    disabled?: boolean
}[] = [
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

const findGroupButton = async (id: string) =>
    await screen.findByTestId(`button-${id}`, { timeout: 5000 })

describe("BaseButtonGroupHorizontal", () => {
    it("Should render all the buttons correctly", async () => {
        render(
            <BaseButtonGroupHorizontal
                action={() => {}}
                buttons={buttons}
                selectedButtonIds={[]}
            />,
            { wrapper: TestWrapper },
        )

        for (const button of buttons) {
            const baseButton = await findGroupButton(button.id)
            expect(baseButton).toBeVisible()
        }
    })

    it("Call the correct function for each button", async () => {
        const mockAction = jest.fn()
        render(
            <BaseButtonGroupHorizontal
                action={mockAction}
                buttons={buttons}
                selectedButtonIds={["2"]}
            />,
            { wrapper: TestWrapper },
        )
        for (const button of buttons) {
            const baseButton = await findGroupButton(button.id)
            expect(baseButton).toBeVisible()
            fireEvent.press(baseButton)
            expect(mockAction).toHaveBeenCalledWith(button)
        }
    })

    it("should disable a disabled button", async () => {
        const mockAction = jest.fn()

        const disabledButton = {
            id: "4",
            label: "Button 4",
            disabled: true,
        }

        const buttonsAndDisabledButton = [...buttons, disabledButton]
        render(
            <BaseButtonGroupHorizontal
                action={mockAction}
                buttons={buttonsAndDisabledButton}
                selectedButtonIds={[]}
            />,
            { wrapper: TestWrapper },
        )
        for (const button of buttonsAndDisabledButton) {
            const baseButton = await findGroupButton(button.id)
            expect(baseButton).toBeVisible()
            if (button.disabled) {
                expect(baseButton).toBeDisabled()
                fireEvent.press(baseButton)
                expect(mockAction).not.toHaveBeenCalledWith(button)
            } else {
                fireEvent.press(baseButton)
                expect(mockAction).toHaveBeenCalledWith(button)
            }
        }
    })
})
