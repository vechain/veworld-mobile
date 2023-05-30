import { renderHook } from "@testing-library/react-hooks"
import { FungibleToken } from "~Model"
import { useToastNotification } from "./useToastNotification"
import { showErrorToast, showSuccessToast } from "~Components"
import { TestWrapper } from "~Test"

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
}))

describe("useToastNotification", () => {
    it("should show found token transfer notification", async () => {
        const token: FungibleToken = {
            symbol: "ABC",
            decimals: 18,
            name: "ABC Token",
            address: "0x123abc",
        } as FungibleToken
        const amount = "1000000000000000000" // 1 ABC in wei
        const { result, waitForNextUpdate } = renderHook(
            () => useToastNotification(),
            {
                wrapper: TestWrapper,
            },
        )
        await waitForNextUpdate()
        const { showFoundTokenTransfer } = result.current
        showFoundTokenTransfer(token, amount)
        expect(showSuccessToast).toHaveBeenCalledWith(
            "Found ABC transfer: 1 ABC",
        )
    })

    it("should show transaction reverted notification", async () => {
        const txId =
            "0x42bae575cc1a83914a60de2da1806de9ca6b2726c6274ee467ef16911daa1e2f"
        const { result, waitForNextUpdate } = renderHook(
            () => useToastNotification(),
            {
                wrapper: TestWrapper,
            },
        )
        await waitForNextUpdate()
        const { showTransactionReverted } = result.current
        showTransactionReverted(txId)
        expect(showErrorToast).toHaveBeenCalledWith(
            "Transaction 0x42ba…1daa1e2f was reverted.",
        )
    })
})
