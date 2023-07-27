/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseBottomSheet } from "./BaseBottomSheet"
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

        const baseView = await screen.findByTestId(
            "BaseView",
            {},
            { timeout: 10000 },
        )
        expect(baseView).toBeVisible()
    })
})
