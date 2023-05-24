import React from "react"
import { TestWrapper } from "~Test"
import { ContactsScreen } from "./ContactsScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("Contacts", {}, { timeout: 5000 })

describe("ContactsScreen", () => {
    it("should render correctly", async () => {
        render(<ContactsScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
