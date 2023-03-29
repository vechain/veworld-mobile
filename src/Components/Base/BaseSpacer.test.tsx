import { TestWrapper } from "~Test"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react-native"
import { BaseSpacer } from "./BaseSpacer"

describe("BaseSpacer", () => {
    it("should render correctly with width prop", async () => {
        const { getByTestId } = render(
            <BaseSpacer testID="BaseSpacer" width={20} />,
            { wrapper: TestWrapper },
        )
        await waitFor(() =>
            expect(screen.getByTestId("BaseSpacer")).toBeTruthy(),
        )
        const view = getByTestId("BaseSpacer")
        expect(view).toBeVisible()
    })
    it("should render correctly with height prop", async () => {
        const { getByTestId } = render(
            <BaseSpacer testID="BaseSpacer" height={20} />,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() =>
            expect(screen.getByTestId("BaseSpacer")).toBeTruthy(),
        )
        const view = getByTestId("BaseSpacer")
        expect(view).toBeVisible()
    })
})
