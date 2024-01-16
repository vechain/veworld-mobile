import { TestWrapper } from "~Test"
import React from "react"
import { render, waitFor } from "@testing-library/react-native"
import { BaseScrollView } from "./BaseScrollView"

describe("BaseScrollView", () => {
    it("renders without crashing", async () => {
        const onScroll = jest.fn()
        const containerStyle = { marginTop: 10 }

        const { getByTestId } = render(
            <BaseScrollView
                onScroll={onScroll}
                testID="ScrollView"
                containerStyle={containerStyle}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(getByTestId("ScrollView")).toBeTruthy())
        expect(getByTestId("ScrollView")).toBeVisible()
    })
})
