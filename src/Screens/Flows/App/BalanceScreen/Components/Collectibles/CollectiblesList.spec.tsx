import React from "react"
import { render, screen } from "@testing-library/react-native"
import { CollectiblesList } from "./CollectiblesList"
import { TestWrapper } from "~Test"

describe("CollectiblesList", () => {
    it("should render correctly", async () => {
        render(<CollectiblesList />, { wrapper: TestWrapper })

        const collectiblesList = await screen.findByTestId("COLLECTIBLES_LIST")
        expect(collectiblesList).toBeOnTheScreen()
    })
})
