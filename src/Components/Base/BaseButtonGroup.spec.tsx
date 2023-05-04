import React from "react"
import { render, fireEvent, screen } from "@testing-library/react-native"
import { BaseButtonGroup } from "./BaseButtonGroup"
import { TestWrapper } from "~Test"
import { ReactTestInstance } from "react-test-renderer"

const baseButtonGroupTestId = "BaseButtonGroup"
const findBaseButtonInGroup = async (id: string) =>
    await screen.findByTestId(
        `${baseButtonGroupTestId}-${id}`,
        {},
        {
            timeout: 5000,
        },
    )

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
                buttonTestID={baseButtonGroupTestId}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        for (const button of buttons) {
            const baseButton = await findBaseButtonInGroup(button.id)
            expect(baseButton).toBeVisible()
        }
    })

    it("Each button click calls action function with the correct params if not disabled ", async () => {
        const mockAction = jest.fn()
        render(
            <BaseButtonGroup
                action={mockAction}
                buttons={buttons}
                selectedButtonIds={selectedButtonIds}
                buttonTestID={baseButtonGroupTestId}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        for (const button of buttons) {
            const baseButton = await findBaseButtonInGroup(button.id)
            expect(baseButton).toBeVisible()
            if (button.disabled) {
                fireEvent.press(baseButton)
                expect(mockAction).not.toHaveBeenCalledWith(button)
            } else {
                fireEvent.press(baseButton)
                expect(mockAction).toHaveBeenCalledWith(button)
            }
        }
    })

    it("uses the correct typographyFont", async () => {
        const mockAction = jest.fn()

        render(
            <BaseButtonGroup
                action={mockAction}
                buttons={buttons}
                selectedButtonIds={selectedButtonIds}
                buttonTestID={baseButtonGroupTestId}
                typographyFont="captionMedium"
            />,
            {
                wrapper: TestWrapper,
            },
        )

        for (const button of buttons) {
            const baseButton = await findBaseButtonInGroup(button.id)
            expect(
                (baseButton.children[0] as ReactTestInstance).props
                    .typographyFont,
            ).toBe("captionMedium")
        }
    })
})
