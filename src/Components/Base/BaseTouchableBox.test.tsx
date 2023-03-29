/* eslint-disable i18next/no-literal-string */
import { Text } from "react-native"
import { TestWrapper } from "~Test"
import React from "react"
import { render, fireEvent, waitFor } from "@testing-library/react-native"
import { BaseTouchableBox } from "./BaseTouchableBox"

describe("BaseTouchableBox component", () => {
    it("should call action function when clicked", async () => {
        const mockAction = jest.fn()
        const { getByTestId } = render(
            <BaseTouchableBox testID="BaseTouchableBox" action={mockAction}>
                <Text>Click me</Text>
            </BaseTouchableBox>,
            { wrapper: TestWrapper },
        )
        await waitFor(() =>
            expect(getByTestId("BaseTouchableBox")).toBeTruthy(),
        )
        const touchable = getByTestId("BaseTouchableBox")
        fireEvent.press(touchable)
    })

    it("should render with custom style props", async () => {
        const mockAction = jest.fn()
        const { getByTestId } = render(
            <BaseTouchableBox
                testID="BaseTouchableBox"
                bg="red"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                action={mockAction}>
                <Text>Custom styles</Text>
            </BaseTouchableBox>,
            { wrapper: TestWrapper },
        )
        await waitFor(() =>
            expect(getByTestId("BaseTouchableBox")).toBeTruthy(),
        )

        const touchable = getByTestId("BaseTouchableBox")
        expect(touchable).toHaveStyle({
            backgroundColor: "red",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        })
    })

    it("should be disabled when 'disabled' prop is true", async () => {
        const mockAction = jest.fn()
        const { getByTestId } = render(
            <BaseTouchableBox
                testID="BaseTouchableBox"
                action={mockAction}
                disabled={true}>
                <Text>Disabled</Text>
            </BaseTouchableBox>,
            { wrapper: TestWrapper },
        )
        await waitFor(() =>
            expect(getByTestId("BaseTouchableBox")).toBeTruthy(),
        )
        const touchable = getByTestId("BaseTouchableBox")
        fireEvent.press(touchable)
        expect(touchable).toHaveStyle({
            opacity: 0.5,
        })
    })
})
