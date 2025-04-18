import { TestWrapper } from "~Test"
import React from "react"
import { render, fireEvent, screen, act, waitFor } from "@testing-library/react-native"
import { BaseButton } from "./BaseButton"
import { BaseIcon } from "./BaseIcon"

const buttonTitle = "Button"
const findButton = async () => await screen.findByText(buttonTitle, {}, { timeout: 5000 })

describe("BaseButton", () => {
    const mockAction = jest.fn()

    afterEach(() => {
        mockAction.mockClear()
    })

    it("renders correctly with default props", async () => {
        render(<BaseButton action={mockAction} title={buttonTitle} />, {
            wrapper: TestWrapper,
        })
        // wait for useEffects
        const button = await findButton()

        expect(button).toBeVisible()
        act(() => {
            fireEvent.press(button)
        })

        expect(mockAction).toHaveBeenCalled()
    })

    it("renders correctly with custom props", async () => {
        render(
            <BaseButton
                action={mockAction}
                title={buttonTitle}
                textColor="#FF0000"
                leftIcon={<BaseIcon name="icon-tent" />}
                rightIcon={<BaseIcon name="icon-tv" />}
            />,
            { wrapper: TestWrapper },
        )

        const button = await findButton()

        expect(button).toBeVisible()

        expect(button).toHaveStyle({
            color: "#FF0000",
        })
    })

    it("renders correctly with corner case props and all haptics", async () => {
        render(
            <BaseButton
                action={mockAction}
                title={buttonTitle}
                variant="outline"
                haptics="Light"
                w={10}
                h={10}
                size={"sm"}
            />,
            { wrapper: TestWrapper },
        )
        // wait for useEffects
        let button = await findButton()

        expect(button).toBeVisible()

        act(() => {
            fireEvent.press(button)
        })

        await waitFor(
            () => {
                expect(mockAction).toHaveBeenCalled()
            },
            { timeout: 5000 },
        )

        render(
            <BaseButton
                action={mockAction}
                title={buttonTitle}
                textColor="#FF0000"
                variant="outline"
                haptics="Medium"
                size={"md"}
            />,
            { wrapper: TestWrapper },
        )
        // wait for useEffects
        button = await findButton()

        expect(button).toBeVisible()
        act(() => {
            fireEvent.press(button)
        })

        await waitFor(
            () => {
                expect(mockAction).toHaveBeenCalled()
            },
            { timeout: 5000 },
        )
        render(
            <BaseButton
                action={mockAction}
                title={buttonTitle}
                textColor="#FF0000"
                variant="link"
                haptics="Heavy"
                px={10}
                py={10}
                typographyFont={"body"}
            />,
            { wrapper: TestWrapper },
        )
        // wait for useEffects
        button = await findButton()

        expect(button).toBeVisible()
        act(() => {
            fireEvent.press(button)
        })

        await waitFor(
            () => {
                expect(mockAction).toHaveBeenCalled()
            },
            { timeout: 5000 },
        )
    })
})
