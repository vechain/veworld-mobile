import { renderHook } from "@testing-library/react-hooks"
import { useSendTransaction } from "./useSendTransaction"
import { TestHelpers, TestWrapper } from "~Test"
import axios, { AxiosError } from "axios"
import { Transaction } from "@vechain/sdk-core"
import { ethers } from "ethers"

jest.mock("axios")

const { vetTransaction1, dappTransaction1, nftTransaction1 } = TestHelpers.data

const toSignedTx = (tx: Transaction) => {
    const randomWallet = ethers.Wallet.createRandom()
    return tx.sign(Buffer.from(randomWallet.privateKey.slice(2), "hex"))
}

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
        const signedTx = toSignedTx(vetTransaction1)
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: signedTx.id },
            status: 200,
        })
        await result.current.sendTransaction(signedTx)
    })

    it("should handle dapp tx", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })
        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        const signedTx = toSignedTx(dappTransaction1)
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: signedTx.id },
        })
        await result.current.sendTransaction(signedTx)
    })

    it("should handle NFT tx", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })
        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        const signedTx = toSignedTx(nftTransaction1)
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: signedTx.id },
        })
        await result.current.sendTransaction(signedTx)
    })

    it("axios throws 403", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })

        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        ;(axios.post as jest.Mock).mockRejectedValue(new AxiosError("Not enough gas"))

        await expect(result.current.sendTransaction(vetTransaction1)).rejects.toEqual(new AxiosError("Not enough gas"))
    })

    it("axios throws unknown error", async () => {
        const { result } = renderHook(() => useSendTransaction(jest.fn()), {
            wrapper: TestWrapper,
        })
        expect(result.current).toEqual({
            sendTransaction: expect.any(Function),
        })
        ;(axios.post as jest.Mock).mockRejectedValue(new Error("Not enough gas"))

        await expect(result.current.sendTransaction(vetTransaction1)).rejects.toEqual(new Error("Not enough gas"))
    })
})
