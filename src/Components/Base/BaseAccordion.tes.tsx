import { TestWrapper } from "~Test"
import React from "react"
import {
    render,
    fireEvent,
    screen,
    act,
    waitFor,
} from "@testing-library/react-native"
import { BaseAccordion } from "./BaseAccordion"
import { View } from "react-native"

describe("BaseAccordion", () => {
    const mockAction = jest.fn()

    afterEach(() => {
        mockAction.mockClear()
    })

    it("renders correctly with default props", async () => {
        render(
            <BaseAccordion
                headerComponent={<View testID="HeaderComponent">header</View>}
                headerStyle={{}}
                headerOpenedStyle={{}}
                headerClosedStyle={{}}
                chevronContainerStyle={{}}
                bodyComponent={<View testID="BodyComponent">body</View>}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        // wait for useEffects
        await waitFor(() =>
            expect(screen.getByText("HeaderComponent")).toBeTruthy(),
        )
        expect(screen.getByText("HeaderComponent")).toBeVisible()
        const header = screen.getByText("HeaderComponent")
        act(() => {
            fireEvent.press(header)
        })
        expect(screen.getByText("BodyComponent")).toBeVisible()
    })
})
