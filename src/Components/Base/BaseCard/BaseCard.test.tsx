import { TestWrapper } from "~Test"
import React from "react"
import { render, waitFor } from "@testing-library/react-native"
import { BaseCard } from "./BaseCard"

describe("BaseCard", () => {
    it("renders correctly", async () => {
        const { getByTestId } = render(<BaseCard testID={"BaseCard"} />, {
            wrapper: TestWrapper,
        })
        // wait for useEffects
        await waitFor(() => expect(getByTestId("BaseCard")).toBeTruthy())

        const baseCard = getByTestId("BaseCard")
        expect(baseCard).toBeVisible()
    })
})
