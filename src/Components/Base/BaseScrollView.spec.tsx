import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseScrollView } from "./BaseScrollView"

const testID = "ScrollView"
const findScrollView = () => screen.findByTestId(testID, {}, { timeout: 5000 })

const containerStyle = { marginTop: 10 }
const onScroll = jest.fn()
describe("BaseScrollView", () => {
    it("renders without crashing", async () => {
        render(
            <BaseScrollView
                onScroll={onScroll}
                testID="ScrollView"
                containerStyle={containerStyle}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        const scrollView = await findScrollView()
        expect(scrollView).toBeVisible()
    })
})
