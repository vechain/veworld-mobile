import { TestWrapper } from "~Test"
import React from "react"
import { render, fireEvent, screen } from "@testing-library/react-native"
import { BaseTouchable } from "./BaseTouchable"

const baseTouchableTestId = "BaseTouchable"
const findBaseTouchable = async () =>
    await screen.findByTestId(baseTouchableTestId, {}, { timeout: 5000 })

const title = "Touch me"
const findBaseTouchableByTitle = async () =>
    await screen.findByText(title, {}, { timeout: 5000 })

describe("BaseTouchable", () => {
    it("renders correctly with title", async () => {
        const onPress = jest.fn()
        render(
            <BaseTouchable
                title={title}
                testID={baseTouchableTestId}
                action={onPress}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const baseTouchable = await findBaseTouchable()
        expect(baseTouchable).toBeVisible()

        const baseTouchableByTitle = await findBaseTouchableByTitle()
        expect(baseTouchableByTitle).toBeVisible()
    })

    it("calls action when pressed", async () => {
        const onPress = jest.fn()
        render(
            <BaseTouchable
                title={title}
                testID={baseTouchableTestId}
                underlined
                action={onPress}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const baseTouchable = await findBaseTouchable()
        expect(baseTouchable).toBeVisible()

        fireEvent.press(baseTouchable)
        expect(onPress).toHaveBeenCalled()
    })
})
