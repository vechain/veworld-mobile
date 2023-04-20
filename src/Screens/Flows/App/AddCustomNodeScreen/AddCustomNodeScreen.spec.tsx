import React from "react"
import { TestWrapper } from "~Test"
import { AddCustomNodeScreen } from "./AddCustomNodeScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("Add a custom node", {}, { timeout: 5000 })

describe("AddCustomNodeScreen", () => {
    it("should render correctly", async () => {
        render(<AddCustomNodeScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
