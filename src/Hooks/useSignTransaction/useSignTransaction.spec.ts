import { TestHelpers, TestWrapper } from "~Test"
import { SignStatus, useSignTransaction } from "./useSignTransaction"
import { renderHook } from "@testing-library/react-hooks"
import { DelegationType } from "~Model/Delegation"
import axios from "axios"
import { Routes } from "~Navigation"
import { WalletEncryptionKeyHelper } from "~Components"
import { Transaction, Secp256k1 } from "@vechain/sdk-core"

jest.mock("axios")

const { vetTransaction1, device1, account1D1, wallet1, smartWalletDevice } = TestHelpers.data

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
    showWarningToast: jest.fn(),
}))

const mockSmartwalletOwnerAddress = "0x4444444444444444444444444444444444444444"
// Hoisted mock: useSmartWallet signer
const mockSignTransactionWithSmartWallet = jest.fn().mockResolvedValue(Buffer.from("aa", "hex"))
jest.mock("~Hooks/useSmartWallet", () => ({
    ...jest.requireActual("~Hooks/useSmartWallet"),
    useSmartWallet: () => ({
        isAuthenticated: true,
        isInitialized: true,
        ownerAddress: mockSmartwalletOwnerAddress,
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

// Mock Generic Delegator and validation
jest.mock("~Networking/GenericDelegator", () => {
    const actual = jest.requireActual("~Networking/GenericDelegator")
    return {
        ...actual,
        isGenericDelegatorUrl: jest.fn((url: string) => url.includes("generic-delegator")),
        delegateGenericDelegator: jest.fn(),
        delegateGenericDelegatorSmartAccount: jest.fn(),
    }
})

jest.mock("~Utils/GenericDelegatorUtils", () => ({
    ...jest.requireActual("~Utils/GenericDelegatorUtils"),
    validateGenericDelegatorTx: jest.fn().mockResolvedValue({ valid: true }),
    validateGenericDelegatorTxSmartAccount: jest.fn().mockResolvedValue({ valid: true }),
}))

describe("useSignTransaction", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(WalletEncryptionKeyHelper.decryptWallet as jest.Mock).mockResolvedValue(wallet1)
    })

    it("should render correctly", async () => {
        const { result } = renderHook(
            () => useSignTransaction({ ...defaultProps, initialRoute: Routes.HOME, selectedDelegationToken: "VTHO" }),
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
            () => useSignTransaction({ ...defaultProps, initialRoute: Routes.HOME, selectedDelegationToken: "VTHO" }),
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
            () => useSignTransaction({ ...defaultProps, initialRoute: Routes.HOME, selectedDelegationToken: "VTHO" }),
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
        it("works as expected and posts correct EOA origin", async () => {
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

            // Assert axios.post called with correct origin and url
            const [[calledUrl, sponsorRequest]] = (axios.post as jest.Mock).mock.calls
            expect(calledUrl).toBe("https://vechainstats.com")
            expect(sponsorRequest).toEqual(
                expect.objectContaining({
                    origin: "0xcf130b42ae33c5531277b4b7c0f1d994b8732957",
                    raw: expect.stringMatching(/^0x[0-9a-f]+$/),
                }),
            )
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

    describe("signAndSendTransaction - generic delegation", () => {
        it("signs the newTx returned by the generic delegator endpoint", async () => {
            // Build a modified transaction (different nonce) to act as newTx from delegator
            const body = vetTransaction1.body as any
            const modifiedTx = Transaction.of({
                chainTag: body.chainTag,
                blockRef: body.blockRef,
                expiration: body.expiration,
                clauses: body.clauses,
                gas: body.gas,
                dependsOn: body.dependsOn,
                nonce: "0xdeadbeef",
                ...(body.maxFeePerGas && body.maxPriorityFeePerGas
                    ? { maxFeePerGas: body.maxFeePerGas, maxPriorityFeePerGas: body.maxPriorityFeePerGas }
                    : { gasPriceCoef: body.gasPriceCoef }),
                ...(body.reserved ? { reserved: body.reserved } : {}),
            })
            const newRaw = `0x${Buffer.from(modifiedTx.encoded).toString("hex")}`

            // Mock delegator to return the modified raw
            const { delegateGenericDelegator } = require("~Networking/GenericDelegator") as {
                delegateGenericDelegator: jest.Mock
            }
            delegateGenericDelegator.mockResolvedValue({
                signature: "0x" + "a".repeat(128) + "00", // 65 bytes signature hex
                address: "0x1111111111111111111111111111111111111111",
                origin: "0x2222222222222222222222222222222222222222",
                raw: newRaw,
            })

            const signSpy = jest
                .spyOn(Secp256k1, "sign")
                // return dummy 65-byte sig, capture input hash for assertion
                .mockImplementation((() => new Uint8Array(65)) as any)

            const { result } = renderHook(
                () =>
                    useSignTransaction({
                        buildTransaction: async () => vetTransaction1,
                        initialRoute: Routes.HOME,
                        selectedDelegationOption: DelegationType.URL,
                        // Non-VTHO token and present fee → triggers generic delegator flow
                        selectedDelegationUrl: "https://generic-delegator.test",
                        selectedDelegationToken: "B3TR",
                        // any truthy value to enable generic path (validate is mocked to valid)
                        genericDelegatorFee: {} as any,
                    }),
                { wrapper: TestWrapper },
            )

            const tx = (await result.current.signTransaction()) as Transaction
            expect(tx).toBeInstanceOf(Transaction)

            // Expect Secp256k1.sign called with hash computed from modifiedTx (newTx), not the original
            expect(signSpy).toHaveBeenCalled()
            const passedHash = Buffer.from(signSpy.mock.calls[0][0])
            const expectedHash = Buffer.from(modifiedTx.getTransactionHash().bytes)
            expect(passedHash.equals(expectedHash)).toBe(true)

            signSpy.mockRestore()
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

    it("should not be possible to use the smart account for delegation with SMART_WALLET device", async () => {
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

        await expect(result.current.signTransaction()).resolves.toEqual(SignStatus.DELEGATION_FAILURE)
    })

    it("URL delegation uses smart wallet owner address as origin", async () => {
        __senderDevice = smartWalletDevice

        // Smart wallets use the generic delegator path only for generic delegator URLs.
        // Build a raw transaction for the mock response
        const rawTx = `0x${Buffer.from(vetTransaction1.encoded).toString("hex")}`

        const { delegateGenericDelegatorSmartAccount } = require("~Networking/GenericDelegator") as {
            delegateGenericDelegatorSmartAccount: jest.Mock
        }
        delegateGenericDelegatorSmartAccount.mockResolvedValue({
            signature: "0x" + "a".repeat(128) + "00", // 65 bytes signature hex
            address: "0x1111111111111111111111111111111111111111",
            origin: mockSmartwalletOwnerAddress,
            raw: rawTx,
        })

        const { result } = renderHook(
            () =>
                useSignTransaction({
                    buildTransaction: async () => vetTransaction1,
                    selectedDelegationOption: DelegationType.URL,
                    selectedDelegationUrl: "https://generic-delegator.test",
                    selectedDelegationToken: "VTHO",
                    genericDelegatorFee: {} as any, // Required for validation to pass
                    genericDelegatorDepositAccount: "0x3333333333333333333333333333333333333333",
                }),
            { wrapper: TestWrapper },
        )

        const tx = (await result.current.signTransaction()) as Transaction

        expect(tx).toBeInstanceOf(Transaction)

        // Verify delegateGenericDelegatorSmartAccount was called with the smart wallet owner address as origin
        expect(delegateGenericDelegatorSmartAccount).toHaveBeenCalledWith(
            expect.objectContaining({
                origin: mockSmartwalletOwnerAddress.toLowerCase(),
                raw: expect.stringMatching(/^0x[0-9a-f]+$/),
            }),
        )
    })

    it("URL delegation with a custom URL does not use generic delegator for smart wallet", async () => {
        __senderDevice = smartWalletDevice
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: {
                signature:
                    // eslint-disable-next-line max-len
                    "0x5b977f9e1a383e6e277c3e1745d9334da966cd9028f5d1f4f98a00dafb1975614edcb547635ca6fcd49114d02b1c1b4de8106fb89ae32b8e7cf02a6e62af53fb01",
            },
        })

        const { delegateGenericDelegatorSmartAccount } = require("~Networking/GenericDelegator") as {
            delegateGenericDelegatorSmartAccount: jest.Mock
        }

        const { result } = renderHook(
            () =>
                useSignTransaction({
                    buildTransaction: async () => vetTransaction1,
                    selectedDelegationOption: DelegationType.URL,
                    selectedDelegationUrl: "https://custom-sponsor.service",
                    selectedDelegationToken: "VTHO",
                    genericDelegatorFee: {} as any,
                    genericDelegatorDepositAccount: "0x3333333333333333333333333333333333333333",
                }),
            { wrapper: TestWrapper },
        )

        const tx = (await result.current.signTransaction()) as Transaction
        expect(tx).toBeInstanceOf(Transaction)

        expect(delegateGenericDelegatorSmartAccount).not.toHaveBeenCalled()
        const [[calledUrl, sponsorRequest]] = (axios.post as jest.Mock).mock.calls
        expect(calledUrl).toBe("https://custom-sponsor.service")
        expect(sponsorRequest).toEqual(
            expect.objectContaining({
                origin: mockSmartwalletOwnerAddress.toLowerCase(),
                raw: expect.stringMatching(/^0x[0-9a-f]+$/),
            }),
        )
    })
})
