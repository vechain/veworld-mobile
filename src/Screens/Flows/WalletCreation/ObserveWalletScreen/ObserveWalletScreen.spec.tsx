import React from "react"
import { TestWrapper } from "~Test"
import { ObserveWalletScreen } from "./ObserveWalletScreen"
import { render, screen } from "@testing-library/react-native"

jest.mock("@gorhom/bottom-sheet", () => ({
    ...jest.requireActual("@gorhom/bottom-sheet"),
}))

const findElement = async () => await screen.findByTestId("Observe_Wallet_Screen", {}, { timeout: 5000 })

describe("ObserveWalletScreen", () => {
    it("should render correctly", async () => {
        render(<ObserveWalletScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
