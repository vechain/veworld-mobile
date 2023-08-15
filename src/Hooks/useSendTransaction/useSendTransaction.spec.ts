import { renderHook } from "@testing-library/react-hooks"
import { useSendTransaction } from "./useSendTransaction"
import { TestHelpers, TestWrapper } from "~Test"
import axios, { AxiosError } from "axios"

jest.mock("axios")

const { vetTransaction1, dappTransaction1, nftTransaction1 } = TestHelpers.data
describe("useSendTransaction", () => {
    it("should render correctly", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })
        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        // gas is undefined for some reasons: maybe we don't have selectedAccount yet
    })

    it("sendTransactionAndPerformUpdates should works as expected", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })
        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: vetTransaction1.id },
            status: 200,
        })
        await result.current.sendTransaction(vetTransaction1)
    })

    it("should handle dapp tx", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })
        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: dappTransaction1.id },
        })
        await result.current.sendTransaction(dappTransaction1)
    })

    it("should handle NFT tx", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })
        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: nftTransaction1.id },
        })
        await result.current.sendTransaction(nftTransaction1)
    })

    it("axios throws 403", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })

        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        ;(axios.post as jest.Mock).mockRejectedValue(
            new AxiosError("Not enough gas"),
        )

        await expect(
            result.current.sendTransaction(vetTransaction1),
        ).rejects.toEqual(new AxiosError("Not enough gas"))
    })

    it("axios throws unknown error", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })
        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        ;(axios.post as jest.Mock).mockRejectedValue(
            new Error("Not enough gas"),
        )

        await expect(
            result.current.sendTransaction(vetTransaction1),
        ).rejects.toEqual(new Error("Not enough gas"))
    })
})
