import React from "react"
import { TestWrapper } from "~Test"
import { ContactsScreen } from "./ContactsScreen"
import { render, screen } from "@testing-library/react-native"

jest.mock("@gorhom/bottom-sheet", () => ({
    ...jest.requireActual("@gorhom/bottom-sheet"),
}))

const findElement = async () => await screen.findByText("My Contacts", {}, { timeout: 5000 })

describe("ContactsScreen", () => {
    it("should render correctly", async () => {
        render(<ContactsScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
