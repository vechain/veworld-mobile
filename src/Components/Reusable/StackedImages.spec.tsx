import { screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"
import { StackedImages } from "./StackedImages"

describe("StackedImages", () => {
    it("should not show the remaining count if < maxImagesBeforeCompression", () => {
        TestHelpers.render.renderComponentWithProps(
            <StackedImages uris={["1", "2", "3"]} maxImagesBeforeCompression={4} />,
            { wrapper: TestWrapper },
        )

        expect(screen.queryByTestId("STACKED_IMAGES_REMAINING_COUNT")).toBeNull()
    })
    it("should not show the remaining count if = maxImagesBeforeCompression", () => {
        TestHelpers.render.renderComponentWithProps(
            <StackedImages uris={["1", "2", "3"]} maxImagesBeforeCompression={3} />,
            { wrapper: TestWrapper },
        )

        expect(screen.queryByTestId("STACKED_IMAGES_REMAINING_COUNT")).toBeNull()
    })
    it("should show the remaining count if > maxImagesBeforeCompression", () => {
        TestHelpers.render.renderComponentWithProps(
            <StackedImages uris={["1", "2", "3"]} maxImagesBeforeCompression={2} />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByTestId("STACKED_IMAGES_REMAINING_COUNT")).toHaveTextContent("+1")
    })
})
