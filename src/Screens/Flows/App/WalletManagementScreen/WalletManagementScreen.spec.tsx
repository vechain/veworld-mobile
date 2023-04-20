import React from "react"
import { TestWrapper } from "~Test"
import { WalletManagementScreen } from "./WalletManagementScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("Wallet management", {}, { timeout: 5000 })

describe("WalletManagementScreen", () => {
    it("should render correctly", async () => {
        render(<WalletManagementScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
