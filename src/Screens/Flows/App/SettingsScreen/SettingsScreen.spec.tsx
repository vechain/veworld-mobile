import React from "react"
import { TestWrapper } from "~Test"
import { SettingsScreen } from "./SettingsScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("Settings", {}, { timeout: 5000 })

describe("SettingsScreen", () => {
    it("should render correctly", async () => {
        render(<SettingsScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
