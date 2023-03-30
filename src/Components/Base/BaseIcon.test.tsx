import { TestWrapper } from "~Test"
import React from "react"
import { render, fireEvent, screen } from "@testing-library/react-native"
import { BaseIcon } from "./BaseIcon"

const testId = "BaseIcon"
const findIcon = async () =>
    await screen.findByTestId(testId, { timeout: 5000 })
const findIconWrapper = async () =>
    await screen.findByTestId(`${testId}-wrapper`, { timeout: 5000 })

describe("BaseIcon", () => {
    it("renders the icon with default values", async () => {
        render(<BaseIcon testID={testId} name="star" />, {
            wrapper: TestWrapper,
        })
        const icon = await findIcon()

        expect(icon).toBeVisible()
    })

    it("calls the action prop when clicked", async () => {
        const mockAction = jest.fn()
        render(<BaseIcon testID={testId} name="star" action={mockAction} />, {
            wrapper: TestWrapper,
        })
        const icon = await findIcon()

        expect(icon).toBeVisible()

        fireEvent.press(icon)
        expect(mockAction).toHaveBeenCalled()
    })

    it("render correctly with corner case props", async () => {
        const mockAction = jest.fn()

        render(
            <BaseIcon
                testID={testId}
                name="star"
                bg="red"
                size={32}
                m={10}
                p={10}
                action={mockAction}
                disabled
            />,
            {
                wrapper: TestWrapper,
            },
        )
        const iconWrapper = await findIconWrapper()
        expect(iconWrapper).toBeVisible()
        expect(iconWrapper).toHaveStyle({
            backgroundColor: "red",
            margin: 10,
            padding: 10,
        })
        let icon = await findIcon()

        expect(icon).toBeVisible()
    })

    it("renders correctly when disabled", async () => {
        const mockAction = jest.fn()

        render(
            <BaseIcon
                testID={testId}
                name="star"
                bg="red"
                size={32}
                m={10}
                p={10}
                action={mockAction}
                disabled
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const iconWrapper = await findIconWrapper()
        expect(iconWrapper).toBeVisible()
        expect(iconWrapper).toHaveStyle({
            backgroundColor: "red",
            margin: 10,
            padding: 10,
        })

        let icon = await findIcon()

        expect(icon).toBeVisible()
        fireEvent.press(icon)
        expect(mockAction).not.toHaveBeenCalled()
    })
})
