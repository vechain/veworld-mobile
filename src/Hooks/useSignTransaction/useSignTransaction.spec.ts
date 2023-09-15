import { TestHelpers, TestWrapper } from "~Test"
import { SignStatus, useSignTransaction } from "./useSignTransaction"
import { renderHook } from "@testing-library/react-hooks"
import { DelegationType } from "~Model/Delegation"
import axios from "axios"
import { Routes } from "~Navigation"
import { Transaction } from "thor-devkit"
import { WalletEncryptionKeyHelper } from "~Components"

jest.mock("axios")

const { vetTransaction1, device1, account1D1, wallet1 } = TestHelpers.data

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
    showWarningToast: jest.fn(),
}))

const defaultProps = {
    buildTransaction: () => {
        return vetTransaction1
    },
    initialRoute: Routes.HOME,
    selectedDelegationOption: DelegationType.NONE,
}

jest.mock("~Components/Providers/EncryptedStorageProvider/Helpers", () => ({
    ...jest.requireActual(
        "~Components/Providers/EncryptedStorageProvider/Helpers",
    ),
    WalletEncryptionKeyHelper: {
        get: jest.fn(),
        set: jest.fn(),
        decryptWallet: jest.fn(),
        encryptWallet: jest.fn(),
        init: jest.fn(),
    },
}))

describe("useSignTransaction", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(
            WalletEncryptionKeyHelper.decryptWallet as jest.Mock
        ).mockResolvedValue(wallet1)
    })

    it("should render correctly", async () => {
        const { result } = renderHook(() => useSignTransaction(defaultProps), {
            wrapper: TestWrapper,
        })

        expect(result.current).toEqual({
            getUrlDelegationSignature: expect.any(Function),
            getAccountDelegationSignature: expect.any(Function),
            signTransaction: expect.any(Function),
            navigateToLedger: expect.any(Function),
        })
    })

    it("signAndSendTransaction - throws error (not mocked decryptWallet)", async () => {
        ;(
            WalletEncryptionKeyHelper.decryptWallet as jest.Mock
        ).mockImplementation(() => {
            throw new Error("Error")
        })

        const { result } = renderHook(() => useSignTransaction(defaultProps), {
            wrapper: TestWrapper,
        })
        expect(result.current).toEqual({
            getUrlDelegationSignature: expect.any(Function),
            getAccountDelegationSignature: expect.any(Function),
            signTransaction: expect.any(Function),
            navigateToLedger: expect.any(Function),
        })

        await expect(result.current.signTransaction()).rejects.toThrow()
    })

    it("signAndSendTransaction - no delegation works as expected", async () => {
        const { result } = renderHook(() => useSignTransaction(defaultProps), {
            wrapper: TestWrapper,
        })

        expect(result.current).toEqual({
            getUrlDelegationSignature: expect.any(Function),
            getAccountDelegationSignature: expect.any(Function),
            signTransaction: expect.any(Function),
            navigateToLedger: expect.any(Function),
        })

        const signedTransaction =
            (await result.current.signTransaction()) as Transaction

        expect(signedTransaction).toBeInstanceOf(Transaction)
        expect(signedTransaction.signature).toBeInstanceOf(Buffer)
        expect(signedTransaction.signature?.length).toEqual(65)
    })

    describe("signAndSendTransaction - account delegation", () => {
        it("works as expected", async () => {
            const { result } = renderHook(
                () =>
                    useSignTransaction({
                        ...defaultProps,
                        selectedDelegationOption: DelegationType.ACCOUNT,
                        selectedDelegationAccount: {
                            ...account1D1,
                            device: device1,
                        },
                    }),
                { wrapper: TestWrapper },
            )

            expect(result.current).toEqual({
                getUrlDelegationSignature: expect.any(Function),
                getAccountDelegationSignature: expect.any(Function),
                signTransaction: expect.any(Function),
                navigateToLedger: expect.any(Function),
            })

            const signedTransaction =
                (await result.current.signTransaction()) as Transaction

            expect(signedTransaction).toBeInstanceOf(Transaction)
            expect(signedTransaction.signature).toBeInstanceOf(Buffer)
            expect(signedTransaction.signature?.length).toEqual(130)
        })

        it("no account throws error", async () => {
            const { result } = renderHook(
                () =>
                    useSignTransaction({
                        ...defaultProps,
                        selectedDelegationOption: DelegationType.ACCOUNT,
                    }),
                { wrapper: TestWrapper },
            )
            expect(result.current).toEqual({
                getUrlDelegationSignature: expect.any(Function),
                getAccountDelegationSignature: expect.any(Function),
                signTransaction: expect.any(Function),
                navigateToLedger: expect.any(Function),
            })

            const res = await result.current.signTransaction()
            expect(res).toEqual(SignStatus.DELEGATION_FAILURE)
        })
    })

    describe("signAndSendTransaction - url delegation", () => {
        it("works as expected", async () => {
            const { result } = renderHook(
                () =>
                    useSignTransaction({
                        ...defaultProps,
                        selectedDelegationOption: DelegationType.URL,
                        selectedDelegationUrl: "https://vechainstats.com",
                    }),
                { wrapper: TestWrapper },
            )

            expect(result.current).toEqual({
                getUrlDelegationSignature: expect.any(Function),
                getAccountDelegationSignature: expect.any(Function),
                signTransaction: expect.any(Function),
                navigateToLedger: expect.any(Function),
            })
            ;(axios.post as jest.Mock).mockResolvedValueOnce({
                data: {
                    signature:
                        "0x5b977f9e1a383e6e277c3e1745d9334da966cd9028f5d1f4f98a00dafb1975614edcb547635ca6fcd49114d02b1c1b4de8106fb89ae32b8e7cf02a6e62af53fb01",
                },
            })

            const signedTransaction =
                (await result.current.signTransaction()) as Transaction

            expect(signedTransaction).toBeInstanceOf(Transaction)
            expect(signedTransaction.signature).toBeInstanceOf(Buffer)
            expect(signedTransaction.signature?.length).toEqual(130)
        })

        it("no url throws error", async () => {
            const { result } = renderHook(
                () =>
                    useSignTransaction({
                        ...defaultProps,
                        selectedDelegationOption: DelegationType.URL,
                    }),
                { wrapper: TestWrapper },
            )

            expect(result.current).toEqual({
                getUrlDelegationSignature: expect.any(Function),
                getAccountDelegationSignature: expect.any(Function),
                signTransaction: expect.any(Function),
                navigateToLedger: expect.any(Function),
            })

            const res = await result.current.signTransaction()

            expect(res).toEqual(SignStatus.DELEGATION_FAILURE)
        })
    })
})
