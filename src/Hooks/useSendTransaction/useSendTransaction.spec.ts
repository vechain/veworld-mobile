import { renderHook } from "@testing-library/react-hooks"
import { useSendTransaction } from "./useSendTransaction"
import { TestHelpers, TestWrapper } from "~Test"
import axios, { AxiosError } from "axios"
import { Transaction } from "@vechain/sdk-core"
import { ethers } from "ethers"
import * as ReduxActions from "~Storage/Redux" // Import the module

// Mock the specific module path used in the hook
jest.mock("~Storage/Redux", () => ({
    // Keep original exports for things you don't want to mock
    ...jest.requireActual("~Storage/Redux"),
    // Mock the specific action creator we need to control
    updateAccountBalances: jest.fn(),
    // Mock useAppDispatch to return a Jest function if needed
    useAppDispatch: () => jest.fn(),
    // Add mocks for any other selectors used if they cause issues,
    // otherwise `requireActual` should handle them.
    // e.g., selectSelectedAccount: jest.fn().mockReturnValue(TestHelpers.data.account1),
}))

// Mock showSuccessToast to avoid React updates in tests
jest.mock("~Components", () => ({
    ...jest.requireActual("~Components"),
    showSuccessToast: jest.fn(),
}))

// Create a typed reference to the mocked function
const mockedUpdateAccountBalances = ReduxActions.updateAccountBalances as jest.Mock

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

        mockedUpdateAccountBalances.mockReturnValueOnce(new Error("Balance update failed huhgh"))

        await expect(result.current.sendTransaction(signedTx)).resolves.toEqual(signedTx.id)
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
