import { TestHelpers, TestWrapper } from "~Test"
import { SignStatus, useSignTransaction } from "./useSignTransaction"
import { renderHook } from "@testing-library/react-hooks"
import { DelegationType } from "~Model/Delegation"
import axios from "axios"
import { Routes } from "~Navigation"
import { WalletEncryptionKeyHelper } from "~Components"
import { Transaction } from "@vechain/sdk-core"

jest.mock("axios")

const { vetTransaction1, device1, account1D1, wallet1, smartWalletDevice } = TestHelpers.data

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
    showWarningToast: jest.fn(),
}))

// Hoisted mock: useSmartWallet signer
const mockSignTransactionWithSmartWallet = jest.fn().mockResolvedValue(Buffer.from("aa", "hex"))
jest.mock("~Hooks/useSmartWallet", () => ({
    ...jest.requireActual("~Hooks/useSmartWallet"),
    useSmartWallet: () => ({
        isAuthenticated: true,
        isInitialized: true,
        ownerAddress: "0x4444444444444444444444444444444444444444",
        signTransaction: mockSignTransactionWithSmartWallet,
    }),
}))

// Hoisted mock: configurable selectDevice to force SMART_WALLET
let __senderDevice: any
jest.mock("~Storage/Redux", () => {
    const actual = jest.requireActual("~Storage/Redux")
    return {
        ...actual,
        selectDevice: jest.fn((state: any, rootAddress?: string) =>
            __senderDevice !== undefined ? __senderDevice : actual.selectDevice(state, rootAddress as any),
        ),
    }
})

const defaultProps = {
    buildTransaction: async () => {
        return vetTransaction1
    },
    initialRoute: Routes.NFTS,
    selectedDelegationOption: DelegationType.NONE,
}

jest.mock("~Components/Providers/EncryptedStorageProvider/Helpers", () => ({
    ...jest.requireActual("~Components/Providers/EncryptedStorageProvider/Helpers"),
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
        ;(WalletEncryptionKeyHelper.decryptWallet as jest.Mock).mockResolvedValue(wallet1)
    })

    it("should render correctly", async () => {
        const { result } = renderHook(
            () => useSignTransaction({ ...defaultProps, initialRoute: Routes.NFTS, selectedDelegationToken: "VTHO" }),
            {
                wrapper: TestWrapper,
            },
        )

        expect(result.current).toEqual({
            signTransaction: expect.any(Function),
            navigateToLedger: expect.any(Function),
        })
    })

    it("signAndSendTransaction - throws error (not mocked decryptWallet)", async () => {
        ;(WalletEncryptionKeyHelper.decryptWallet as jest.Mock).mockImplementation(() => {
            throw new Error("Error")
        })

        const { result } = renderHook(
            () => useSignTransaction({ ...defaultProps, initialRoute: Routes.NFTS, selectedDelegationToken: "VTHO" }),
            {
                wrapper: TestWrapper,
            },
        )
        expect(result.current).toEqual({
            signTransaction: expect.any(Function),
            navigateToLedger: expect.any(Function),
        })

        await expect(result.current.signTransaction()).rejects.toThrow()
    })

    it("signAndSendTransaction - no delegation works as expected", async () => {
        const { result } = renderHook(
            () => useSignTransaction({ ...defaultProps, initialRoute: Routes.NFTS, selectedDelegationToken: "VTHO" }),
            {
                wrapper: TestWrapper,
            },
        )

        expect(result.current).toEqual({
            signTransaction: expect.any(Function),
            navigateToLedger: expect.any(Function),
        })

        const signedTransaction = (await result.current.signTransaction()) as Transaction

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
                        initialRoute: Routes.HOME,
                        selectedDelegationToken: "VTHO",
                    }),
                { wrapper: TestWrapper },
            )

            expect(result.current).toEqual({
                signTransaction: expect.any(Function),
                navigateToLedger: expect.any(Function),
            })

            const signedTransaction = (await result.current.signTransaction()) as Transaction

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
                        initialRoute: Routes.HOME,
                        selectedDelegationToken: "VTHO",
                    }),
                { wrapper: TestWrapper },
            )
            expect(result.current).toEqual({
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
                        initialRoute: Routes.HOME,
                        selectedDelegationToken: "VTHO",
                    }),
                { wrapper: TestWrapper },
            )

            expect(result.current).toEqual({
                signTransaction: expect.any(Function),
                navigateToLedger: expect.any(Function),
            })
            ;(axios.post as jest.Mock).mockResolvedValueOnce({
                data: {
                    signature:
                        // eslint-disable-next-line max-len
                        "0x5b977f9e1a383e6e277c3e1745d9334da966cd9028f5d1f4f98a00dafb1975614edcb547635ca6fcd49114d02b1c1b4de8106fb89ae32b8e7cf02a6e62af53fb01",
                },
            })

            const signedTransaction = (await result.current.signTransaction()) as Transaction

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
                        initialRoute: Routes.HOME,
                        selectedDelegationToken: "VTHO",
                    }),
                { wrapper: TestWrapper },
            )

            expect(result.current).toEqual({
                signTransaction: expect.any(Function),
                navigateToLedger: expect.any(Function),
            })

            const res = await result.current.signTransaction()

            expect(res).toEqual(SignStatus.DELEGATION_FAILURE)
        })
    })
})

describe("useSignTransaction - SMART_WALLET", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(WalletEncryptionKeyHelper.decryptWallet as jest.Mock).mockResolvedValue(wallet1)
        __senderDevice = undefined
    })

    it("should be possible to use the smart account for sending a transaction with SMART_WALLET device", async () => {
        __senderDevice = smartWalletDevice

        const { result } = renderHook(
            () =>
                useSignTransaction({
                    buildTransaction: async () => vetTransaction1,
                    selectedDelegationOption: DelegationType.NONE,
                    selectedDelegationToken: "VTHO",
                }),
            { wrapper: TestWrapper },
        )

        const tx = (await result.current.signTransaction()) as Transaction
        expect(mockSignTransactionWithSmartWallet).toHaveBeenCalledTimes(1)
        expect(mockSignTransactionWithSmartWallet).toHaveBeenCalledWith(expect.any(Transaction))
        expect(tx).toBeInstanceOf(Transaction)
    })

    it("should be possible to use the smart account for delegation with SMART_WALLET device", async () => {
        __senderDevice = smartWalletDevice
        const smartDelegationAccount = { ...account1D1, device: smartWalletDevice }

        const { result } = renderHook(
            () =>
                useSignTransaction({
                    buildTransaction: async () => vetTransaction1,
                    selectedDelegationOption: DelegationType.ACCOUNT,
                    selectedDelegationAccount: smartDelegationAccount,
                    selectedDelegationToken: "VTHO",
                }),
            { wrapper: TestWrapper },
        )

        const res = await result.current.signTransaction()
        // Called once for delegation smart wallet and once for sender smart wallet
        expect(mockSignTransactionWithSmartWallet).toHaveBeenCalledTimes(2)
        expect(mockSignTransactionWithSmartWallet).toHaveBeenCalledWith(expect.any(Transaction))
        expect(res instanceof Transaction).toBe(true)
    })
})
