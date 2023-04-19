/* eslint-disable i18next/no-literal-string */
import { Text } from "react-native"
import { TestWrapper } from "~Test"
import React from "react"
import { render, fireEvent, screen } from "@testing-library/react-native"
import { BaseTouchableBox } from "./BaseTouchableBox"

const baseTouchableBoxTestId = "BaseTouchableBox"
const findBaseTouchableBox = async () =>
    screen.findByTestId(baseTouchableBoxTestId, {}, { timeout: 5000 })

describe("BaseTouchableBox component", () => {
    it("should call action function when clicked", async () => {
        const mockAction = jest.fn()
        render(
            <BaseTouchableBox
                testID={baseTouchableBoxTestId}
                action={mockAction}>
                <Text>Click me</Text>
            </BaseTouchableBox>,
            { wrapper: TestWrapper },
        )
        const baseTouchable = await findBaseTouchableBox()
        expect(baseTouchable).toBeVisible()
        fireEvent.press(baseTouchable)
        expect(mockAction).toHaveBeenCalled()
    })

    it("should render with custom style props", async () => {
        const mockAction = jest.fn()
        render(
            <BaseTouchableBox
                testID={baseTouchableBoxTestId}
                bg="red"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                action={mockAction}>
                <Text>Custom styles</Text>
            </BaseTouchableBox>,
            { wrapper: TestWrapper },
        )
        const baseTouchable = await findBaseTouchableBox()
        expect(baseTouchable).toBeVisible()
        expect(baseTouchable.props.children.props.style[0][0]).toMatchObject({
            alignItems: "center",
            backgroundColor: "red",
            borderRadius: 16,
            flexDirection: "row",
            justifyContent: "center",
            opacity: 1,
            overflow: "hidden",
            paddingHorizontal: 16,
            paddingVertical: 12,
        })
    })

    it("should be disabled when 'disabled' prop is true", async () => {
        const mockAction = jest.fn()
        render(
            <BaseTouchableBox
                testID={baseTouchableBoxTestId}
                action={mockAction}
                disabled={true}>
                <Text>Disabled</Text>
            </BaseTouchableBox>,
            { wrapper: TestWrapper },
        )
        const baseTouchable = await findBaseTouchableBox()
        expect(baseTouchable).toBeVisible()

        expect(baseTouchable.props.children.props.style[0][0]).toMatchObject({
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "#FFFFFF",
            opacity: 0.5,
            borderRadius: 16,
            overflow: "hidden",
        })
    })
})
