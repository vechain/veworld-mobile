import "~Test"
import React from "react"
import { render, waitFor } from "@testing-library/react-native"
import { BaseSearchInput } from "./BaseSearchInput"
import { TestWrapper } from "~Test"

describe("BaseSearchInput", () => {
    it("renders correctly", async () => {
        const { getByPlaceholderText, getByTestId } = render(
            <BaseSearchInput />,
            {
                wrapper: TestWrapper,
            },
        )
        // wait for useEffects
        await waitFor(() => expect(getByPlaceholderText("Search")).toBeTruthy())

        const input = getByPlaceholderText("Search")
        const icon = getByTestId("magnify")

        expect(input).toBeVisible()
        expect(icon).toBeVisible()
    })
})
