/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, fireEvent, waitFor, act } from "@testing-library/react-native"
import { BaseSwitch } from "./BaseSwitch"

describe("BaseSwitch component", () => {
    it("renders switch component", async () => {
        const onValueChange = jest.fn()
        const { getByTestId } = render(
            <BaseSwitch
                value={true}
                onValueChange={onValueChange}
                testID={"BaseSwitch"}
            />,
            { wrapper: TestWrapper },
        )
        await waitFor(() => expect(getByTestId("BaseSwitch")).toBeTruthy())
        const switchElement = getByTestId("BaseSwitch")
        expect(switchElement).toBeVisible()
    })

    it("renders switch without value", async () => {
        const onValueChange = jest.fn()
        const { getByTestId } = render(
            <BaseSwitch onValueChange={onValueChange} testID={"BaseSwitch"} />,
            { wrapper: TestWrapper },
        )
        await waitFor(() => expect(getByTestId("BaseSwitch")).toBeTruthy())
        const switchElement = getByTestId("BaseSwitch")
        expect(switchElement).toBeVisible()
    })

    it("handles onValueChange callback", async () => {
        const onValueChange = jest.fn()
        const { getByTestId } = render(
            <BaseSwitch
                value={true}
                onValueChange={onValueChange}
                testID={"BaseSwitch"}
            />,
            { wrapper: TestWrapper },
        )
        await waitFor(() => expect(getByTestId("BaseSwitch")).toBeTruthy())
        const switchElement = getByTestId("BaseSwitch")
        act(() => fireEvent(switchElement, "valueChange", false))
        expect(onValueChange).toHaveBeenCalledWith(false)
    })
})
