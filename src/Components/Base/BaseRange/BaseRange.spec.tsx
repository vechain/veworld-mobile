import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseRange } from "./BaseRange"

const baseRangeTestId = "BaseRange"
const findBaseRange = async () =>
    await screen.findByTestId(baseRangeTestId, {}, { timeout: 5000 })

describe("BaseRange", () => {
    it("renders correctly", async () => {
        render(
            <BaseRange
                value={0}
                maximumValue={100}
                onChange={jest.fn()}
                testID={baseRangeTestId}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const baseRange = await findBaseRange()
        expect(baseRange).toBeVisible()
    })
})
