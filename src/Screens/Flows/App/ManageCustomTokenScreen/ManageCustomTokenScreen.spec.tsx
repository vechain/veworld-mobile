import React from "react"
import { TestWrapper } from "~Test"
import { ManageCustomTokenScreen } from "./ManageCustomTokenScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("Manage custom tokens", {}, { timeout: 5000 })

describe("ManageCustomTokenScreen", () => {
    it("should render correctly", async () => {
        render(<ManageCustomTokenScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
