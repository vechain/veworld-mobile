import { TestWrapper } from "~Test"
import React from "react"
import { render, fireEvent, act, screen } from "@testing-library/react-native"
import { BaseSwitch } from "./BaseSwitch"

const baseSwitchTestId = "BaseSwitch"
const findBaseSwitch = async () =>
    screen.findByTestId(baseSwitchTestId, { timeout: 5000 })

describe("BaseSwitch component", () => {
    it("renders switch component", async () => {
        const onValueChange = jest.fn()
        render(
            <BaseSwitch
                value={true}
                onValueChange={onValueChange}
                testID={baseSwitchTestId}
            />,
            { wrapper: TestWrapper },
        )
        const baseSwitch = await findBaseSwitch()

        expect(baseSwitch).toBeVisible()
    })

    it("renders switch without value", async () => {
        const onValueChange = jest.fn()
        render(
            <BaseSwitch
                onValueChange={onValueChange}
                testID={baseSwitchTestId}
            />,
            { wrapper: TestWrapper },
        )
        const baseSwitch = await findBaseSwitch()

        expect(baseSwitch).toBeVisible()
    })

    it("handles onValueChange callback", async () => {
        const onValueChange = jest.fn()
        render(
            <BaseSwitch
                value={true}
                onValueChange={onValueChange}
                testID={baseSwitchTestId}
            />,
            { wrapper: TestWrapper },
        )
        const baseSwitch = await findBaseSwitch()

        expect(baseSwitch).toBeVisible()
        act(() => fireEvent(baseSwitch, "valueChange", false))
        expect(onValueChange).toHaveBeenCalledWith(false)
    })
})
