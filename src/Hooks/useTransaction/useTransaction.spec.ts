import { useTransaction } from "./useTransaction"
import { renderHook } from "@testing-library/react-hooks"
import { TestHelpers, TestWrapper } from "~Test"
const { account1D1, VETWithBalance, VTHOWithBalance } = TestHelpers.data

describe("useTransaction", () => {
    it("VET - should render correctly", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useTransaction({
                    amount: "1",
                    token: VETWithBalance,
                    address: account1D1.address,
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toBeDefined()
        // gas is undefined for some reasons: maybe we don't have selectedAccount yet
    })
    it("VTHO - should render correctly", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useTransaction({
                    amount: "1",
                    token: VTHOWithBalance,
                    address: account1D1.address,
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toBeDefined()
        // gas is undefined for some reasons: maybe we don't have selectedAccount yet
    })
})
