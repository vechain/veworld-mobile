import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseSearchInput } from "./BaseSearchInput"

const customPlaceholder = "CustomPlaceholder"

const findTextInput = async (placeholder: string = "Search") =>
    await screen.findByPlaceholderText(placeholder, { timeout: 5000 })
const findMagnifyIcon = async () =>
    screen.findByTestId("magnify", { timeout: 5000 })

describe("BaseSearchInput", () => {
    it("renders correctly", async () => {
        render(<BaseSearchInput />, {
            wrapper: TestWrapper,
        })
        const textInput = await findTextInput()
        const magnifyIcon = await findMagnifyIcon()

        expect(textInput).toBeVisible()
        expect(magnifyIcon).toBeVisible()
    })

    it("renders a custom placeholder", async () => {
        render(<BaseSearchInput placeholder={customPlaceholder} />, {
            wrapper: TestWrapper,
        })
        const textInput = await findTextInput(customPlaceholder)
        const magnifyIcon = await findMagnifyIcon()

        expect(textInput).toBeVisible()
        expect(magnifyIcon).toBeVisible()
    })
})
