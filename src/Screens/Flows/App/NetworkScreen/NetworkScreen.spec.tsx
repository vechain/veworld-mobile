import React from "react"
import { TestWrapper } from "~Test"
import { ChangeNetworkScreen } from "./NetworkScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText(
        "Other networks - show conversion",
        {},
        { timeout: 5000 },
    )

describe("ChangeNetworkScreen", () => {
    it("should render correctly", async () => {
        render(<ChangeNetworkScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
