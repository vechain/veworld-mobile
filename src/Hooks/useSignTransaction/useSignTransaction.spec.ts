import { TestHelpers, TestWrapper } from "~Test"
import { useSignTransaction } from "./useSignTransaction"
import { renderHook } from "@testing-library/react-hooks"
import { DelegationType } from "~Model/Delegation"
import { showErrorToast } from "~Components"
import { CryptoUtils } from "~Utils"
import axios from "axios"

jest.mock("axios")

const { vetTransaction1, wallet1, device1, account1D1 } = TestHelpers.data

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
    showWarningToast: jest.fn(),
}))

describe("useSignTransaction", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useSignTransaction({
                    clauses: vetTransaction1.body.clauses,
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
            buildTransaction: expect.any(Function),
            signTransaction: expect.any(Function),
            signAndSendTransaction: expect.any(Function),
            sendTransactionAndPerformUpdates: expect.any(Function),
            getUrlDelegationSignature: expect.any(Function),
            navigateToLedger: expect.any(Function),
        })
    })

    it("signAndSendTransaction - throws error (not mocked decryptWallet)", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useSignTransaction({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: false,
                    onTXFinish: jest.fn(),
                    selectedDelegationOption: DelegationType.NONE,
                    onError: jest.fn(),
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            signTransaction: expect.any(Function),
            signAndSendTransaction: expect.any(Function),
            sendTransactionAndPerformUpdates: expect.any(Function),
            getUrlDelegationSignature: expect.any(Function),
            navigateToLedger: expect.any(Function),
            buildTransaction: expect.any(Function),
        })

        await result.current.signAndSendTransaction()
        expect(showErrorToast).toHaveBeenCalled()
    })

    it("signAndSendTransaction - no delegation works as expected", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () =>
                useSignTransaction({
                    clauses: vetTransaction1.body.clauses,
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
            signTransaction: expect.any(Function),
            signAndSendTransaction: expect.any(Function),
            sendTransactionAndPerformUpdates: expect.any(Function),
            getUrlDelegationSignature: expect.any(Function),
            navigateToLedger: expect.any(Function),
            buildTransaction: expect.any(Function),
        })
        jest.spyOn(CryptoUtils, "decryptWallet").mockResolvedValueOnce({
            decryptedWallet: wallet1,
            encryptionKey: "encryptionKey",
        })
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: vetTransaction1.id },
            status: 200,
        })

        await result.current.signAndSendTransaction()
    })

    describe("signAndSendTransaction - account delegation", () => {
        it("works as expected", async () => {
            const { result, waitForNextUpdate } = renderHook(
                () =>
                    useSignTransaction({
                        clauses: vetTransaction1.body.clauses,
                        isDelegated: true,
                        onTXFinish: jest.fn(),
                        selectedDelegationOption: DelegationType.ACCOUNT,
                        selectedDelegationAccount: {
                            ...account1D1,
                            device: device1,
                        },
                    }),
                { wrapper: TestWrapper },
            )
            await waitForNextUpdate({
                timeout: 5000,
            })

            expect(result.current).toEqual({
                signTransaction: expect.any(Function),
                signAndSendTransaction: expect.any(Function),
                sendTransactionAndPerformUpdates: expect.any(Function),
                getUrlDelegationSignature: expect.any(Function),
                navigateToLedger: expect.any(Function),
                buildTransaction: expect.any(Function),
            })
            jest.spyOn(CryptoUtils, "decryptWallet").mockResolvedValueOnce({
                decryptedWallet: wallet1,
                encryptionKey: "encryptionKey",
            })
            ;(axios.post as jest.Mock).mockResolvedValueOnce({
                data: { id: vetTransaction1.id },
                status: 200,
            })

            await result.current.signAndSendTransaction()
        })

        it("no account throws error", async () => {
            const { result, waitForNextUpdate } = renderHook(
                () =>
                    useSignTransaction({
                        clauses: vetTransaction1.body.clauses,
                        isDelegated: true,
                        onTXFinish: jest.fn(),
                        selectedDelegationOption: DelegationType.ACCOUNT,
                    }),
                { wrapper: TestWrapper },
            )
            await waitForNextUpdate({
                timeout: 5000,
            })

            expect(result.current).toEqual({
                signTransaction: expect.any(Function),
                signAndSendTransaction: expect.any(Function),
                sendTransactionAndPerformUpdates: expect.any(Function),
                getUrlDelegationSignature: expect.any(Function),
                navigateToLedger: expect.any(Function),
                buildTransaction: expect.any(Function),
            })
            jest.spyOn(CryptoUtils, "decryptWallet").mockResolvedValueOnce({
                decryptedWallet: wallet1,
                encryptionKey: "encryptionKey",
            })
            ;(axios.post as jest.Mock).mockResolvedValueOnce({
                data: { id: vetTransaction1.id },
                status: 200,
            })

            await result.current.signAndSendTransaction()
            expect(showErrorToast).toHaveBeenCalled()
        })
        it("ledger account shows warning", async () => {
            const { result, waitForNextUpdate } = renderHook(
                () =>
                    useSignTransaction({
                        clauses: vetTransaction1.body.clauses,
                        isDelegated: true,
                        onTXFinish: jest.fn(),
                        selectedDelegationOption: DelegationType.ACCOUNT,
                    }),
                { wrapper: TestWrapper },
            )
            await waitForNextUpdate({
                timeout: 5000,
            })

            expect(result.current).toEqual({
                signTransaction: expect.any(Function),
                signAndSendTransaction: expect.any(Function),
                sendTransactionAndPerformUpdates: expect.any(Function),
                getUrlDelegationSignature: expect.any(Function),
                navigateToLedger: expect.any(Function),
                buildTransaction: expect.any(Function),
            })
            jest.spyOn(CryptoUtils, "decryptWallet").mockResolvedValueOnce({
                decryptedWallet: wallet1,
                encryptionKey: "encryptionKey",
            })
            ;(axios.post as jest.Mock).mockResolvedValueOnce({
                data: { id: vetTransaction1.id },
                status: 200,
            })

            await result.current.signAndSendTransaction()
        })
    })

    describe("signAndSendTransaction - url delegation", () => {
        it("works as expected", async () => {
            const { result, waitForNextUpdate } = renderHook(
                () =>
                    useSignTransaction({
                        clauses: vetTransaction1.body.clauses,
                        isDelegated: true,
                        onTXFinish: jest.fn(),
                        selectedDelegationOption: DelegationType.URL,
                        selectedDelegationUrl: "https://vechainstats.com",
                    }),
                { wrapper: TestWrapper },
            )
            await waitForNextUpdate({
                timeout: 5000,
            })

            expect(result.current).toEqual({
                buildTransaction: expect.any(Function),
                signTransaction: expect.any(Function),
                signAndSendTransaction: expect.any(Function),
                sendTransactionAndPerformUpdates: expect.any(Function),
                getUrlDelegationSignature: expect.any(Function),
                navigateToLedger: expect.any(Function),
            })
            jest.spyOn(CryptoUtils, "decryptWallet").mockResolvedValueOnce({
                decryptedWallet: wallet1,
                encryptionKey: "encryptionKey",
            })
            ;(axios.post as jest.Mock).mockResolvedValueOnce({
                data: { id: vetTransaction1.id },
                status: 200,
            })

            await result.current.signAndSendTransaction()
        })

        it("no url throws error", async () => {
            const { result, waitForNextUpdate } = renderHook(
                () =>
                    useSignTransaction({
                        clauses: vetTransaction1.body.clauses,
                        isDelegated: true,
                        onTXFinish: jest.fn(),
                        selectedDelegationOption: DelegationType.URL,
                        selectedDelegationUrl: undefined,
                    }),
                { wrapper: TestWrapper },
            )
            await waitForNextUpdate({
                timeout: 5000,
            })

            expect(result.current).toEqual({
                signTransaction: expect.any(Function),
                signAndSendTransaction: expect.any(Function),
                sendTransactionAndPerformUpdates: expect.any(Function),
                getUrlDelegationSignature: expect.any(Function),
                navigateToLedger: expect.any(Function),
                buildTransaction: expect.any(Function),
            })
            jest.spyOn(CryptoUtils, "decryptWallet").mockResolvedValueOnce({
                decryptedWallet: wallet1,
                encryptionKey: "encryptionKey",
            })
            ;(axios.post as jest.Mock).mockResolvedValueOnce({
                data: { id: vetTransaction1.id },
                status: 200,
            })

            await result.current.signAndSendTransaction()
            expect(showErrorToast).toHaveBeenCalled()
        })
    })
})
