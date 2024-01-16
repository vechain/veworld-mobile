/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseBottomSheet } from "./BaseBottomSheet"
import { View } from "react-native"
import { BaseView } from "./BaseView"

const baseBottomSheetContentTestId = "BaseBottomSheetContent"

// NOTE: it's not possible to test more than that
describe("BaseBottomSheet", () => {
    it("renders correctly without errors", async () => {
        render(
            <>
                <BaseBottomSheet snapPoints={["50%", "75%", "90%"]}>
                    <View testID={baseBottomSheetContentTestId}>Child</View>
                </BaseBottomSheet>
                <BaseView testID="BaseView" />
            </>,
            {
                wrapper: TestWrapper,
            },
        )

        const baseView = await screen.findByTestId("BaseView")
        expect(baseView).toBeVisible()
    })
})
