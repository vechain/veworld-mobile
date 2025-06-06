import React from "react"
import { TestWrapper } from "~Test"
import { ManageTokenScreen } from "./ManageTokenScreen"
import { render, screen } from "@testing-library/react-native"

jest.mock("@gorhom/bottom-sheet", () => ({
    ...jest.requireActual("@gorhom/bottom-sheet"),
}))

const findElement = async () => await screen.findByText("Manage Tokens", {}, { timeout: 5000 })

describe("ManageTokenScreen", () => {
    it("should render correctly", async () => {
        render(<ManageTokenScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
