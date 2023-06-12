import { TestHelpers, TestWrapper } from "~Test"
import { useSignTransaction } from "./useSignTransaction"
import { renderHook } from "@testing-library/react-hooks"
import { DelegationType } from "~Model/Delegation"
import { showErrorToast } from "~Components"
import { CryptoUtils } from "~Utils"
import axios from "axios"

jest.mock("axios")

const { vetTransaction1, wallet1 } = TestHelpers.data

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
    showWarningToast: jest.fn(),
}))

describe("useSignTransaction", () => {
    it("should render correctly", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useSignTransaction({
                    transaction: vetTransaction1.body,
                    isDelegated: false,
                    onTXFinish: jest.fn(),
                    selectedDelegationOption: DelegationType.NONE,
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            signAndSendTransaction: expect.any(Function),
            sendTransactionAndPerformUpdates: expect.any(Function),
        })
    })

    it("signAndSendTransaction - throws error (not mocked decryptWallet)", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useSignTransaction({
                    transaction: vetTransaction1.body,
                    isDelegated: false,
                    onTXFinish: jest.fn(),
                    selectedDelegationOption: DelegationType.NONE,
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            signAndSendTransaction: expect.any(Function),
            sendTransactionAndPerformUpdates: expect.any(Function),
        })
        await result.current.signAndSendTransaction()
        expect(showErrorToast).toHaveBeenCalled()
    })

    it("signAndSendTransaction - no delegation works as expected", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useSignTransaction({
                    transaction: vetTransaction1.body,
                    isDelegated: false,
                    onTXFinish: jest.fn(),
                    selectedDelegationOption: DelegationType.NONE,
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })

        expect(result.current).toEqual({
            signAndSendTransaction: expect.any(Function),
            sendTransactionAndPerformUpdates: expect.any(Function),
        })

        jest.spyOn(CryptoUtils, "decryptWallet").mockImplementationOnce(
            () =>
                new Promise(resolve =>
                    resolve({
                        encryptionKey: "fdfgfdd",
                        decryptedWallet: wallet1,
                    }),
                ),
        )
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: vetTransaction1.id },
        })

        await result.current.signAndSendTransaction()
    })
})
