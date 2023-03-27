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
import { typography } from "~Common/Theme"

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

    it("renders correctly with corner case props and all haptics", async () => {
        render(
            <BaseButton
                action={mockAction}
                title="Button"
                variant="outline"
                haptics="light"
                w={10}
                h={10}
                size={"sm"}
            />,
            { wrapper: TestWrapper },
        )
        // wait for useEffects
        await waitFor(() => expect(screen.getByText("Button")).toBeTruthy())

        let button = screen.getByText("Button")
        act(() => {
            fireEvent.press(button)
        })

        expect(mockAction).toHaveBeenCalled()

        render(
            <BaseButton
                action={mockAction}
                title="Button"
                textColor="#FF0000"
                variant="outline"
                haptics="medium"
                size={"md"}
            />,
            { wrapper: TestWrapper },
        )
        // wait for useEffects
        await waitFor(() => expect(screen.getByText("Button")).toBeTruthy())

        button = screen.getByText("Button")
        act(() => {
            fireEvent.press(button)
        })

        expect(mockAction).toHaveBeenCalled()
        render(
            <BaseButton
                action={mockAction}
                title="Button"
                textColor="#FF0000"
                variant="link"
                haptics="heavy"
                px={10}
                py={10}
                typographyFont={"body"}
            />,
            { wrapper: TestWrapper },
        )
        // wait for useEffects
        await waitFor(() => expect(screen.getByText("Button")).toBeTruthy())

        button = screen.getByText("Button")
        act(() => {
            fireEvent.press(button)
        })

        expect(mockAction).toHaveBeenCalled()
    })
})
