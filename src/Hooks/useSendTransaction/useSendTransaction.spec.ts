import { renderHook } from "@testing-library/react-hooks"
import { useSendTransaction } from "./useSendTransaction"
import { TestHelpers, TestWrapper } from "~Test"
import axios, { AxiosError } from "axios"
import { Transaction } from "@vechain/sdk-core"
import { ethers } from "ethers"

const mockDispatch = jest.fn()

const mockUpdateAccountBalances = jest.fn()

jest.mock("~Storage/Redux", () => {
    const originalModule = jest.requireActual("~Storage/Redux")
    return {
        ...originalModule,
        updateAccountBalances: () => mockUpdateAccountBalances,
        useAppDispatch: () => mockDispatch,
    }
})

jest.mock("~Components", () => ({
    ...jest.requireActual("~Components"),
    showSuccessToast: jest.fn(),
}))

jest.mock("axios")

jest.mock("react-native-toast-message", () => {
    // Mock Toast component that renders null
    const Toast = () => null

    // Mock Toast static methods
    Toast.show = jest.fn()
    Toast.hide = jest.fn()
    Toast.setRef = jest.fn()

    // Create a BaseToast component mock that renders null
    const BaseToast = () => null

    // Export both the default Toast and named BaseToast
    return {
        __esModule: true,
        default: Toast,
        BaseToast,
    }
})

const { vetTransaction1, dappTransaction1, nftTransaction1 } = TestHelpers.data

const toSignedTx = (tx: Transaction) => {
    const randomWallet = ethers.Wallet.createRandom()
    return tx.sign(Buffer.from(randomWallet.privateKey.slice(2), "hex"))
}

describe("useSendTransaction", () => {
    beforeEach(() => {
        mockDispatch.mockClear()
        mockUpdateAccountBalances.mockClear()
    })

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

    it("should return transaction ID even if update balances fails", async () => {
        mockUpdateAccountBalances.mockImplementationOnce(() => {
            throw new Error("Balance update failed")
        })
        // Setup mock dispatch to actually execute the thunk action
        mockDispatch.mockImplementation(action => {
            if (typeof action === "function") {
                return action()
            }
            return action
        })

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

        // Test should pass since the hook catches the error and returns the transaction ID
        await expect(result.current.sendTransaction(signedTx)).resolves.toEqual(signedTx.id)
        // Verify dispatch was called
        expect(mockDispatch).toHaveBeenCalled()
        expect(mockUpdateAccountBalances).toHaveBeenCalled()
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
