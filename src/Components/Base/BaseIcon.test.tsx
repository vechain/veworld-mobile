import { TestWrapper } from "~Test"
import React from "react"
import {
    render,
    fireEvent,
    screen,
    act,
    waitFor,
} from "@testing-library/react-native"
import { BaseIcon } from "./BaseIcon"

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
        await waitFor(() => expect(screen.getByTestId("BaseIcon")).toBeTruthy())

        fireEvent.press(screen.getByTestId("BaseIcon"))
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
        await waitFor(() => expect(screen.getByTestId("BaseIcon")).toBeTruthy())

        expect(screen.getByTestId("BaseIcon")).toBeVisible()

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
        await waitFor(() => expect(screen.getByTestId("BaseIcon")).toBeTruthy())

        expect(screen.getByTestId("BaseIcon")).toBeVisible()

        render(<BaseIcon testID="BaseIcon" name="star" bg="red" disabled />, {
            wrapper: TestWrapper,
        })
        await waitFor(() => expect(screen.getByTestId("BaseIcon")).toBeTruthy())

        expect(screen.getByTestId("BaseIcon")).toBeVisible()
    })
})
