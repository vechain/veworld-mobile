import React from "react"
import { TestWrapper } from "~Test"
import { SettingsScreen } from "./SettingsScreen"
import { render, screen } from "@testing-library/react-native"

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useScrollToTop: jest.fn(),
}))
const findElement = async () =>
    await screen.findByTestId("settings-screen", {}, { timeout: 5000 })

describe("SettingsScreen", () => {
    it("should render correctly", async () => {
        render(<SettingsScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
