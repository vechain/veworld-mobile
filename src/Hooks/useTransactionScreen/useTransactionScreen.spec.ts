jest.mock("@vechain/sdk-network", () => {
    const mockClient = {
        gas: {
            estimateGas: () => ({ totalGas: 21000 }),
        },
        transactions: {
            // @ts-ignore
            buildTransactionBody: (clauses, parsedGasLimit, options) => ({
                chainTag: 39,
                blockRef: "0x00cfde3b1f486b72",
                expiration: 18,
                clauses,
                gas: parsedGasLimit,
                dependsOn: null,
                nonce: "0xc64a13b1",
                isDelegated: options?.isDelegated ?? false,
                maxFeePerGas: options?.maxFeePerGas ?? 2000000000000000000,
                maxPriorityFeePerGas: options?.maxPriorityFeePerGas ?? 1000000000000000000,
            }),
        },
        contracts: {
            load: jest.fn().mockReturnValue({
                read: {
                    getAccountAddress: jest.fn().mockResolvedValue(["0x4444444444444444444444444444444444444444"]),
                    hasLegacyAccount: jest.fn().mockResolvedValue([false]),
                    version: jest.fn().mockResolvedValue(["3"]),
                },
            }),
        },
        accounts: {
            getAccount: jest.fn().mockResolvedValue({ hasCode: true }),
        },
        blocks: {
            getGenesisBlock: () => {
                return {
                    id: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
                    headers: { get: jest.fn().mockReturnValue("2.1.3") },
                }
            },
        },
    }

    return {
        ThorClient: {
            at: () => {
                return mockClient
            },
        },
    }
})

import { act, renderHook } from "@testing-library/react-hooks"
import { TestHelpers, TestWrapper } from "~Test"
import { waitFor } from "@testing-library/react-native"
import { Transaction } from "@vechain/sdk-core"

import { useBiometrics, useTransactionScreen, useWalletSecurity } from "~Hooks"
import { Routes } from "~Navigation"
import { AccountWithDevice, BaseDevice, SecurityLevelType, TransactionRequest } from "~Model"
import crypto from "react-native-quick-crypto"
import axios, { AxiosError } from "axios"
import { selectDevice, selectSelectedAccount } from "~Storage/Redux"
import { initialState, WalletEncryptionKeyHelper } from "~Components"
import { BigNutils } from "~Utils"
import { useSendTransaction } from "~Hooks/useSendTransaction"
import { i18nObject } from "~i18n"
import { showErrorToast } from "~Components/Base/BaseToast"
import { loadLocale } from "~i18n/i18n-util.sync"
import { setAuthenticatedUser, setMockPrivyProviderResp } from "../../Test/mocks/@privy-io/expo"
import { useSmartWallet } from "~VechainWalletKit/providers/SmartWalletProvider"

const { vetTransaction1, account1D1, device1, firstLedgerAccount, ledgerDevice, wallet1, smartWalletDevice } =
    TestHelpers.data

const onTransactionSuccess = jest.fn()
const onTransactionFailure = jest.fn()
const mockNav = jest.fn()

jest.mock("../useBiometrics")
jest.mock("../useWalletSecurity")
jest.mock("react-native-quick-crypto")
jest.mock("axios", () => ({
    ...Object.keys(jest.requireActual("axios")).reduce((pre, methodName) => ({ ...pre, [methodName]: jest.fn() }), {}),
    AxiosError: jest.requireActual("axios").AxiosError,
}))
jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    selectSelectedAccount: jest.fn(),
    selectDevice: jest.fn(),
    getDefaultDelegationUrl: jest.fn().mockReturnValue("https://example.com"),
}))

let mockUseFeatureFlags = { ...initialState }

jest.mock("~Components/Providers/FeatureFlagsProvider", () => ({
    ...jest.requireActual("~Components/Providers/FeatureFlagsProvider"),
    useFeatureFlags: () => mockUseFeatureFlags,
}))

jest.mock("~Hooks/useSendTransaction")

// Minimal mock so gas calculation doesn't block this test file
jest.mock("~Hooks/useTransactionGas", () => ({
    useTransactionGas: () => ({
        gas: { outputs: [], totalGas: 21000 },
        loadingGas: false,
        setGas: jest.fn(),
        setGasPayer: jest.fn(),
        calculateGasFees: jest.fn().mockResolvedValue({ outputs: [], totalGas: 21000 }),
    }),
}))

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

jest.mock("~Components/Providers/NotificationsProvider", () => ({
    NotificationsProvider: ({ children }: { children: React.ReactNode }) => children,
    useNotifications: () => ({
        // Add any methods/properties that NotificationsProvider exposes
        showNotification: jest.fn(),
        hideNotification: jest.fn(),
    }),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: () => ({
        goBack: jest.fn(),
        getState: jest.fn(),
        navigate: mockNav,
    }),
}))

jest.mock("~Components/Base/BaseToast")

// Mock the three hooks for generic delegation
jest.mock("~Hooks/useGenericDelegationFees")
jest.mock("~Hooks/useGenericDelegationTokens")
jest.mock("~Hooks/useDelegatorDepositAddress")

// Import the getSmartAccount mock so we can configure it
import { getSmartAccount } from "~VechainWalletKit/utils/smartAccount"

// Import the hooks we need to mock
import { useGenericDelegationFees } from "~Hooks/useGenericDelegationFees"
import { useGenericDelegationTokens } from "~Hooks/useGenericDelegationTokens"
import { useDelegatorDepositAddress } from "~Hooks/useDelegatorDepositAddress"

jest.mock("~VechainWalletKit/utils/smartAccount", () => ({
    ...jest.requireActual("~VechainWalletKit/utils/smartAccount"),
    getSmartAccount: jest.fn(),
}))

// Cast to jest.Mock for type safety
const mockedGetSmartAccount = getSmartAccount as jest.MockedFunction<typeof getSmartAccount>
const mockedUseGenericDelegationFees = useGenericDelegationFees as jest.MockedFunction<typeof useGenericDelegationFees>
const mockedUseGenericDelegationTokens = useGenericDelegationTokens as jest.MockedFunction<
    typeof useGenericDelegationTokens
>
const mockedUseDelegatorDepositAddress = useDelegatorDepositAddress as jest.MockedFunction<
    typeof useDelegatorDepositAddress
>

const mockAccount = (accountWithDevice: AccountWithDevice) => {
    // @ts-ignore
    ;(selectSelectedAccount as jest.Mock).mockReturnValue(accountWithDevice)
}

const mockDevice = (device: BaseDevice) => {
    // @ts-ignore
    ;(selectDevice as jest.Mock).mockReturnValue(device)
}

describe("useTransactionScreen", () => {
    beforeEach(() => {
        jest.resetAllMocks()
        // Mock the hooks to return loading states for testing
        mockedUseGenericDelegationFees.mockReturnValue({
            options: undefined,
            allOptions: undefined,
            isLoading: true,
            isFirstTimeLoading: false,
        })

        mockedUseDelegatorDepositAddress.mockReturnValue({
            depositAccount: "0x1234567890",
            isLoading: true,
        })

        mockedUseGenericDelegationTokens.mockReturnValue({
            tokens: ["VTHO"],
            isLoading: false,
        })
        ;(useBiometrics as jest.Mock).mockReturnValue({
            currentSecurityLevel: SecurityLevelType.BIOMETRIC,
            authTypeAvailable: "FACIAL_RECOGNITION",
            isDeviceEnrolled: true,
            isHardwareAvailable: true,
            accessControl: true,
        })
        ;(useWalletSecurity as jest.Mock).mockReturnValue({
            isWalletSecurityBiometrics: true,
            isWalletSecurityPassword: false,
            isWalletSecurityNone: false,
            biometrics: {
                currentSecurityLevel: SecurityLevelType.BIOMETRIC,
                authTypeAvailable: "FACIAL_RECOGNITION",
                isDeviceEnrolled: true,
                isHardwareAvailable: true,
                accessControl: true,
            },
        })
        ;(crypto.randomFillSync as jest.Mock).mockReturnValue(Buffer.from("1234abc", "hex"))
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: "0x1234" },
            status: 200,
        })

        // Mock axios.get for gas estimation
        ;(axios.get as jest.Mock).mockResolvedValue({
            data: {
                id: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
                number: 0,
                size: 170,
                parentID: "0x0000000000000000000000000000000000000000000000000000000000000000",
                timestamp: 1530014400,
                gasLimit: 10000000,
                beneficiary: "0x0000000000000000000000000000000000000000",
                gasUsed: 0,
                totalScore: 0,
                txsRoot: "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
                stateRoot: "0x4ec3af0acbad1ae467ad569337d2fe8576fe303928d35b8cdd91de47e9ac84bb",
                receiptsRoot: "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
                signer: "0x0000000000000000000000000000000000000000",
                transactions: [],
            },
            headers: {
                get: jest.fn().mockReturnValue("2.1.3"),
            },
            status: 200,
        })
        mockAccount({
            ...account1D1,
            device: device1,
        })
        mockDevice(device1)
        ;(WalletEncryptionKeyHelper.decryptWallet as jest.Mock).mockResolvedValue(wallet1)
    })

    it("hook should render", async () => {
        ;(useSendTransaction as jest.Mock).mockImplementation(
            jest.requireActual("~Hooks/useSendTransaction").useSendTransaction,
        )
        const { result } = renderHook(
            () =>
                useTransactionScreen({
                    clauses: vetTransaction1.body.clauses,
                    onTransactionSuccess,
                    onTransactionFailure,
                }),
            {
                wrapper: TestWrapper,
            },
        )

        expect(result.current).toEqual({
            selectedDelegationOption: "NONE",
            loadingGas: false,
            onSubmit: expect.any(Function),
            isLoading: false,
            isPasswordPromptOpen: false,
            handleClosePasswordModal: expect.any(Function),
            onPasswordSuccess: expect.any(Function),
            setSelectedFeeOption: expect.any(Function),
            selectedFeeOption: 127,
            gasOptions: {
                "0": {
                    estimatedFee: BigNutils("0"),
                    maxFee: BigNutils("0"),
                    priorityFee: BigNutils("0"),
                },
                "127": {
                    estimatedFee: BigNutils("0"),
                    maxFee: BigNutils("0"),
                    priorityFee: BigNutils("0"),
                },
                "255": {
                    estimatedFee: BigNutils("0"),
                    maxFee: BigNutils("0"),
                    priorityFee: BigNutils("0"),
                },
            },
            gasUpdatedAt: expect.any(Number),
            resetDelegation: expect.any(Function),
            setSelectedDelegationAccount: expect.any(Function),
            setSelectedDelegationUrl: expect.any(Function),
            isEnoughGas: true,
            isDelegated: false,
            selectedDelegationAccount: undefined,
            selectedDelegationUrl: undefined,
            isDisabledButtonState: true,
            maxFee: BigNutils("0"),
            estimatedFee: BigNutils("0"),
            isBaseFeeRampingUp: false,
            isGalactica: false,
            speedChangeEnabled: false,
            selectedDelegationToken: "VTHO",
            setSelectedDelegationToken: expect.any(Function),
            fallbackToVTHO: expect.any(Function),
            availableTokens: ["VTHO"],
            hasEnoughBalanceOnAny: true,
            hasEnoughBalanceOnToken: {
                B3TR: true,
                VET: true,
                VTHO: true,
            },
            isFirstTimeLoadingFees: false,
            isBiometricsEmpty: false,
            transactionOutputs: [],
        })
    })

    describe("send token transaction", () => {
        it("should submit transaction", async () => {
            ;(useSendTransaction as jest.Mock).mockImplementation(
                jest.requireActual("~Hooks/useSendTransaction").useSendTransaction,
            )
            const { result } = renderHook(
                () =>
                    useTransactionScreen({
                        clauses: vetTransaction1.body.clauses,
                        onTransactionSuccess,
                        onTransactionFailure,
                        dappRequest: {
                            isFirstRequest: true,
                            method: "thor_sendTransaction",
                            id: "1234",
                            type: "in-app",
                            message: [],
                            options: {
                                gas: 210000,
                            },
                            appUrl: "https://example.com",
                            appName: "Example",
                        },
                    }),
                {
                    wrapper: TestWrapper,
                },
            )

            await act(async () => await result.current.onSubmit())

            await waitFor(
                () => {
                    expect(onTransactionSuccess).toHaveBeenCalled()
                },
                { timeout: 10000 },
            )

            const transaction: Transaction = onTransactionSuccess.mock.calls[0][0]

            const transactionId: string = onTransactionSuccess.mock.calls[0][1]

            expect(transactionId).toBeDefined()
            expect(transaction).toBeInstanceOf(Transaction)
        }, 20000)

        describe("error messages on submit", () => {
            loadLocale("en")
            const LL = i18nObject("en")
            it.each([
                {
                    thorMessage: "insufficient energy",
                    isAxios: true,
                    result: LL.SEND_TRANSACTION_ERROR_INSUFFICIENT_ENERGY(),
                },
                {
                    thorMessage: "gas price is less than block base fee",
                    isAxios: true,
                    result: LL.SEND_TRANSACTION_ERROR_GAS_FEE(),
                },
                { thorMessage: "unknown message", isAxios: true, result: LL.SEND_TRANSACTION_ERROR_GENERIC_ERROR() },
                { isAxios: false, result: LL.SEND_TRANSACTION_ERROR_GENERIC_ERROR() },
            ])(
                "should error: isAxios: $isAxios, thorMessage: $thorMessage",
                async ({ isAxios, result: localizedResult, thorMessage }) => {
                    ;(useSendTransaction as jest.Mock).mockImplementation(() => ({
                        sendTransaction: jest.fn().mockRejectedValue(
                            isAxios
                                ? new AxiosError(
                                      "ERROR",
                                      "403",
                                      undefined,
                                      {},
                                      {
                                          data: thorMessage!,
                                          status: 403,
                                          statusText: "Forbidden",
                                          config: {} as any,
                                          headers: {},
                                      },
                                  )
                                : new Error("MESSAGE"),
                        ),
                    }))
                    const { result } = renderHook(
                        () =>
                            useTransactionScreen({
                                clauses: vetTransaction1.body.clauses,
                                onTransactionSuccess,
                                onTransactionFailure,
                                dappRequest: {
                                    isFirstRequest: true,
                                    method: "thor_sendTransaction",
                                    id: "1234",
                                    type: "in-app",
                                    message: [],
                                    options: {
                                        gas: 210000,
                                    },
                                    appUrl: "https://example.com",
                                    appName: "Example",
                                },
                            }),
                        {
                            wrapper: TestWrapper,
                        },
                    )

                    await act(async () => await result.current.onSubmit())

                    await waitFor(
                        () => {
                            expect(onTransactionFailure).toHaveBeenCalled()
                            expect(showErrorToast).toHaveBeenCalledWith(
                                expect.objectContaining({
                                    text2: `${LL.SEND_TRANSACTION_ERROR()}${localizedResult}`,
                                }),
                            )
                        },
                        { timeout: 10000 },
                    )
                },
                20000,
            )
        })

        it("should only allow submitting one transaction at a time", async () => {
            ;(useSendTransaction as jest.Mock).mockImplementation(
                jest.requireActual("~Hooks/useSendTransaction").useSendTransaction,
            )
            const { result } = renderHook(
                () =>
                    useTransactionScreen({
                        clauses: vetTransaction1.body.clauses,
                        onTransactionSuccess,
                        onTransactionFailure,
                        dappRequest: {
                            isFirstRequest: true,
                            method: "thor_sendTransaction",
                            id: "1234",
                            type: "in-app",
                            message: [],
                            options: {
                                gas: 210000,
                            },
                            appUrl: "https://example.com",
                            appName: "Example",
                        },
                    }),
                {
                    wrapper: TestWrapper,
                },
            )

            await act(async () => {
                result.current.onSubmit()
                // The button should be disabled immediately after the first submission
                expect(result.current.isDisabledButtonState).toBe(true)
                result.current.onSubmit()
            })

            await waitFor(
                () => {
                    expect(onTransactionSuccess).toHaveBeenCalled()
                },
                { timeout: 10000 },
            )
        }, 20000)

        it("using ledger account should navigate", async () => {
            ;(useSendTransaction as jest.Mock).mockImplementation(
                () => jest.requireActual("~Hooks/useSendTransaction").useSendTransaction,
            )
            const accWithDevice = {
                ...firstLedgerAccount,
                device: ledgerDevice,
            }

            mockAccount(accWithDevice)
            mockDevice(ledgerDevice)

            const dappRequest: TransactionRequest = {
                isFirstRequest: true,
                method: "thor_sendTransaction",
                id: "1234",
                type: "in-app",
                message: [],
                options: {
                    gas: 210000,
                },
                appUrl: "https://example.com",
                appName: "Example",
            }

            const { result } = renderHook(
                () =>
                    useTransactionScreen({
                        clauses: vetTransaction1.body.clauses,
                        onTransactionSuccess,
                        onTransactionFailure,
                        dappRequest: dappRequest,
                        initialRoute: Routes.HOME,
                    }),
                {
                    wrapper: TestWrapper,
                },
            )

            await act(async () => await result.current.onSubmit())

            await waitFor(
                () => {
                    expect(mockNav).toHaveBeenCalledWith(Routes.LEDGER_SIGN_TRANSACTION, {
                        accountWithDevice: accWithDevice,
                        initialRoute: "Home",
                        transaction: Transaction.of({
                            blockRef: "0x00ce27a27f982a6d",
                            chainTag: 39,
                            clauses: [
                                {
                                    data: "0x",
                                    to: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68",
                                    value: "0x1043561a8829300000",
                                },
                            ],
                            dependsOn: null,
                            expiration: 100,
                            gas: 0,
                            gasPriceCoef: 127,
                            nonce: "0x1234ab",
                        }),
                        delegationSignature: undefined,
                        dappRequest,
                    })
                },
                { timeout: 10000 },
            )
        }, 20000)

        it("should submit transaction using a smart wallet account", async () => {
            mockUseFeatureFlags = { ...initialState, smartWalletFeature: { enabled: true } }
            ;(useSendTransaction as jest.Mock).mockImplementation(
                jest.requireActual("~Hooks/useSendTransaction").useSendTransaction,
            )
            // Set up authenticated user
            setAuthenticatedUser("test-user-v3-deployed")
            setMockPrivyProviderResp(
                "0x4444444444444444444444444444444444444444",
                "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef1b",
            )

            // Mock the getSmartAccount function to return desired smart account config
            mockedGetSmartAccount.mockResolvedValue({
                address: "0x4444444444444444444444444444444444444444",
                version: 3,
                isDeployed: true,
                hasV1Account: false,
                factoryAddress: "0x713b908Bcf77f3E00EFEf328E50b657a1A23AeaF",
            })

            const accWithDevice = {
                ...firstLedgerAccount,
                device: smartWalletDevice,
            }

            mockAccount(accWithDevice)
            mockDevice(smartWalletDevice)

            // Now render the transaction screen hook
            // Minimal mock is applied at module level via jest.mock("~Hooks/useTransactionGas") above
            const { result } = renderHook(
                () => {
                    const smartWalletHook = useSmartWallet()
                    const txScreenHook = useTransactionScreen({
                        clauses: vetTransaction1.body.clauses,
                        onTransactionSuccess,
                        onTransactionFailure,
                        dappRequest: {
                            isFirstRequest: true,
                            method: "thor_sendTransaction",
                            id: "1234",
                            type: "in-app",
                            message: [],
                            options: {
                                gas: 210000,
                            },
                            appUrl: "https://example.com",
                            appName: "Example",
                        },
                    })
                    return { smartWalletHook, txScreenHook }
                },

                {
                    wrapper: TestWrapper,
                },
            )

            // Wait for smart wallet authentication and initialization
            await waitFor(
                () => {
                    expect(result.current.smartWalletHook.isAuthenticated).toBe(true)
                    expect(result.current.smartWalletHook.isInitialized).toBe(true)
                    expect(result.current.smartWalletHook.ownerAddress).toBe(
                        "0x4444444444444444444444444444444444444444",
                    )
                },
                { timeout: 5000 },
            )

            // expect(result.current.txScreenHook.isDisabledButtonState).toBe(false)
            // expect(result.current.txScreenHook.isLoading).toBe(false)

            await act(async () => await result.current.txScreenHook.onSubmit())

            await waitFor(
                () => {
                    expect(onTransactionSuccess).toHaveBeenCalled()
                },
                { timeout: 3000 },
            )

            const transaction: Transaction = onTransactionSuccess.mock.calls[0][0]
            const transactionId: string = onTransactionSuccess.mock.calls[0][1]

            expect(transactionId).toBeDefined()
            expect(transaction).toBeInstanceOf(Transaction)
            mockUseFeatureFlags = { ...initialState, smartWalletFeature: { enabled: false } }
        }, 20000)

        it("should return isLoading true when smart wallet account is waiting for gen delegation fees", async () => {
            mockUseFeatureFlags = { ...initialState, smartWalletFeature: { enabled: true } }
            ;(useSendTransaction as jest.Mock).mockImplementation(
                jest.requireActual("~Hooks/useSendTransaction").useSendTransaction,
            )
            // Set up authenticated user
            setAuthenticatedUser("test-user-v3-deployed")
            setMockPrivyProviderResp(
                "0x4444444444444444444444444444444444444444",
                "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef1b",
            )

            // Mock the getSmartAccount function to return desired smart account config
            mockedGetSmartAccount.mockResolvedValue({
                address: "0x4444444444444444444444444444444444444444",
                version: 3,
                isDeployed: true,
                hasV1Account: false,
                factoryAddress: "0x713b908Bcf77f3E00EFEf328E50b657a1A23AeaF",
            })

            const accWithDevice = {
                ...firstLedgerAccount,
                device: smartWalletDevice,
            }

            mockAccount(accWithDevice)
            mockDevice(smartWalletDevice)

            // Mock the hooks to return loading states for testing
            mockedUseGenericDelegationFees.mockReturnValueOnce({
                options: undefined,
                allOptions: undefined,
                isLoading: true,
                isFirstTimeLoading: true,
            })

            mockedUseDelegatorDepositAddress.mockReturnValueOnce({
                depositAccount: "",
                isLoading: true,
            })

            // Now render the transaction screen hook
            // Minimal mock is applied at module level via jest.mock("~Hooks/useTransactionGas") above
            const { result } = renderHook(
                () => {
                    const smartWalletHook = useSmartWallet()
                    const txScreenHook = useTransactionScreen({
                        clauses: vetTransaction1.body.clauses,
                        onTransactionSuccess,
                        onTransactionFailure,
                        dappRequest: {
                            isFirstRequest: true,
                            method: "thor_sendTransaction",
                            id: "1234",
                            type: "in-app",
                            message: [],
                            options: {
                                gas: 210000,
                            },
                            appUrl: "https://example.com",
                            appName: "Example",
                        },
                    })
                    return { smartWalletHook, txScreenHook }
                },

                {
                    wrapper: TestWrapper,
                },
            )

            // Wait for smart wallet authentication and initialization
            await waitFor(
                () => {
                    expect(result.current.smartWalletHook.isAuthenticated).toBe(true)
                    expect(result.current.smartWalletHook.isInitialized).toBe(true)
                    expect(result.current.smartWalletHook.ownerAddress).toBe(
                        "0x4444444444444444444444444444444444444444",
                    )
                },
                { timeout: 5000 },
            )

            expect(result.current.txScreenHook.isLoading).toBe(true)
            expect(result.current.txScreenHook.isDisabledButtonState).toBe(true)

            mockUseFeatureFlags = { ...initialState, smartWalletFeature: { enabled: false } }
        }, 20000)
    })
})
