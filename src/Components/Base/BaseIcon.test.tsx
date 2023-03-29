import { TestWrapper } from "~Test"
import React from "react"
import {
    render,
    fireEvent,
    screen,
    waitFor,
} from "@testing-library/react-native"
import { BaseIcon } from "./BaseIcon"

const findIcon = async () => await screen.findByTestId("BaseIcon")

describe("BaseIcon", () => {
    it("renders the icon with default values", async () => {
        render(<BaseIcon testID="BaseIcon" name="star" />, {
            wrapper: TestWrapper,
        })
        await waitFor(() => expect(screen.getByTestId("BaseIcon")).toBeTruthy())
    })

    it("calls the action prop when clicked", async () => {
        const mockAction = jest.fn()
        render(<BaseIcon testID="BaseIcon" name="star" action={mockAction} />, {
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
                testID="BaseIcon"
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
        let icon = await findIcon()

        expect(icon).toBeVisible()

        render(
            <BaseIcon
                testID="BaseIcon"
                name="star"
                bg="red"
                action={mockAction}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        icon = await findIcon()

        expect(icon).toBeVisible()

        render(<BaseIcon testID="BaseIcon" name="star" bg="red" disabled />, {
            wrapper: TestWrapper,
        })
        icon = await findIcon()

        expect(icon).toBeVisible()
    })
})
