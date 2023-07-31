import React from "react"
import { TestWrapper } from "~Test"
import { WalletManagementScreen } from "./WalletManagementScreen"
import { render, screen } from "@testing-library/react-native"
import { useCheckIdentity } from "~Hooks"

const findElement = async () =>
    await screen.findByText("Wallet management", {}, { timeout: 5000 })

jest.mock("~Hooks/useCheckIdentity", () => ({
    useCheckIdentity: jest.fn(),
}))
;(useCheckIdentity as jest.Mock).mockReturnValue({
    ConfirmIdentityBottomSheet: () => <></>,
})
describe("WalletManagementScreen", () => {
    it("should render correctly", async () => {
        render(<WalletManagementScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
