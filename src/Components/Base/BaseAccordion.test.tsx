import { TestWrapper } from "~Test"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react-native"
import { BaseAccordion } from "./BaseAccordion"
import { View } from "react-native"

describe("BaseAccordion", () => {
    it("renders correctly with default props", async () => {
        render(
            <BaseAccordion
                headerComponent={
                    <View testID="HeaderComponent">HeaderComponent</View>
                }
                headerStyle={{}}
                headerOpenedStyle={{}}
                headerClosedStyle={{}}
                chevronContainerStyle={{}}
                bodyComponent={
                    <View testID="BodyComponent">BodyComponent</View>
                }
            />,
            {
                wrapper: TestWrapper,
            },
        )
        // wait for useEffects
        await waitFor(() =>
            expect(screen.getByTestId("HeaderComponent")).toBeTruthy(),
        )
    })
})
