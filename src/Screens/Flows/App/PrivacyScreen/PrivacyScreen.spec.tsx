import React from "react"
import { TestWrapper } from "~Test"
import { PrivacyScreen } from "./PrivacyScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("Privacy and Security", {}, { timeout: 5000 })

describe("PrivacyScreen", () => {
    it("should render correctly", async () => {
        render(<PrivacyScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
