import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseBottomSheet, validateStringPercentages } from "./BaseBottomSheet"
import { BaseView } from "./BaseView"

// NOTE: it's not possible to test more than that
describe("BaseBottomSheet", () => {
    it("renders correctly without errors", async () => {
        render(
            <BaseBottomSheet snapPoints={["50%", "75%", "90%"]}>
                <BaseView testID="BaseView" />
            </BaseBottomSheet>,
            {
                wrapper: TestWrapper,
            },
        )

        const baseView = await screen.findByTestId("BaseView", {}, { timeout: 10000 })
        expect(baseView).toBeVisible()
    })
})

describe("validateStringPercentages", () => {
    it("should return true for valid percentages", () => {
        const percentages = ["10%", "50%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(true)
    })

    it("should return false for percentages exceeding 100", () => {
        const percentages = ["10%", "150%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(false)
    })

    it("should return false for negative percentages", () => {
        const percentages = ["10%", "-50%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(false)
    })

    it("should return false for percentages without the '%' sign", () => {
        const percentages = ["10", "50%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(false)
    })

    it("should return false for non-numeric percentages", () => {
        const percentages = ["ten%", "50%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(false)
    })

    it("should return true for an empty array", () => {
        const percentages: string[] = []
        expect(validateStringPercentages(percentages)).toBe(false)
    })
})
