import React from "react"
import { TestWrapper } from "~Test"
import { AdvancedScreen } from "./AdvancedScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("Advanced", {}, { timeout: 5000 })

describe("AdvancedScreen", () => {
    it("should render correctly", async () => {
        render(<AdvancedScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
