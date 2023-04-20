import React from "react"
import { TestWrapper } from "~Test"
import { DiscoverScreen } from "./DiscoverScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("Discover", {}, { timeout: 5000 })

describe("DiscoverScreen", () => {
    it("should render correctly", async () => {
        render(<DiscoverScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
