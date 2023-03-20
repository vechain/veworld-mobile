import { TestWrapper } from "~Test"
import React from "react"
import {
    render,
    fireEvent,
    screen,
    act,
    waitFor,
} from "@testing-library/react-native"
import { BaseButton } from "./BaseButton"
import { BaseIcon } from "./BaseIcon"

describe("BaseButton", () => {
    const mockAction = jest.fn()

    afterEach(() => {
        mockAction.mockClear()
    })

    it("renders correctly with default props", async () => {
        render(<BaseButton action={mockAction} title="Button" />, {
            wrapper: TestWrapper,
        })
        // wait for useEffects
        await waitFor(() => expect(screen.getByText("Button")).toBeTruthy())

        const button = screen.getByText("Button")
        act(() => {
            fireEvent.press(button)
        })

        expect(mockAction).toHaveBeenCalled()
    })

    it("renders correctly with custom props", async () => {
        const { getByText } = render(
            <BaseButton
                action={mockAction}
                title="Button"
                textColor="#FF0000"
                leftIcon={<BaseIcon name="ab-testing" />}
                rightIcon={<BaseIcon name="abacus" />}
            />,
            { wrapper: TestWrapper },
        )
        await waitFor(() => expect(screen.getByText("Button")).toBeTruthy())

        const button = getByText("Button")
        expect(button).toBeTruthy()
        expect(button).toHaveStyle({
            color: "#FF0000",
        })
    })
})
