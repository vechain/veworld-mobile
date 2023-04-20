import React from "react"
import { TestWrapper } from "~Test"
import { ManageCustomNodesScreen } from "./ManageCustomNodesScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("Custom nodes", {}, { timeout: 5000 })

describe("ManageCustomNodesScreen", () => {
    it("should render correctly", async () => {
        render(<ManageCustomNodesScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
