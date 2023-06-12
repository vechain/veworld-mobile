import { renderHook } from "@testing-library/react-hooks"
import { useSendTransaction } from "./useSendTransaction"
import { TestHelpers, TestWrapper } from "~Test"
import { defaultMainNetwork } from "~Constants"
import axios from "axios"
jest.mock("axios")

const { vetTransaction1, account1D1 } = TestHelpers.data
describe("useSendTransaction", () => {
    it("should render correctly", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useSendTransaction(defaultMainNetwork, account1D1),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            sendTransactionAndPerformUpdates: expect.any(Function),
        })
        // gas is undefined for some reasons: maybe we don't have selectedAccount yet
    })

    it("sendTransactionAndPerformUpdates should works as expected", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useSendTransaction(defaultMainNetwork, account1D1),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            sendTransactionAndPerformUpdates: expect.any(Function),
        })
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: vetTransaction1.id },
        })
        await result.current.sendTransactionAndPerformUpdates(vetTransaction1)
    })
})
