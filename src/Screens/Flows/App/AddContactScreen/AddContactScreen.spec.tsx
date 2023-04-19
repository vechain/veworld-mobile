import React from "react"
import { TestWrapper } from "~Test"
import { AddContactScreen } from "./AddContactScreen"
import { render, screen } from "@testing-library/react-native"

const findTitle = async () =>
    await screen.findByText("Add Contact", {}, { timeout: 5000 })

describe("AddContactScreen", () => {
    it("should render correctly", async () => {
        render(<AddContactScreen />, {
            wrapper: TestWrapper,
        })
        await findTitle()
    })
})
