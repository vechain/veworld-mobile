import { act, renderHook } from "@testing-library/react-hooks"
import { TestHelpers, TestWrapper } from "~Test"
import { waitFor } from "@testing-library/react-native"
import { Transaction } from "@vechain/sdk-core"

import { useBiometrics, useTransactionScreen, useWalletSecurity } from "~Hooks"
import { Routes } from "~Navigation"
import { AccountWithDevice, BaseDevice, SecurityLevelType, TransactionRequest } from "~Model"
import crypto from "react-native-quick-crypto"
import axios, { AxiosError } from "axios"
import { selectDevice, selectSelectedAccount, selectVthoTokenWithBalanceByAccount } from "~Storage/Redux"
import { WalletEncryptionKeyHelper } from "~Components"
import { BigNutils } from "~Utils"
import { useSendTransaction } from "~Hooks/useSendTransaction"
import { i18nObject } from "~i18n"
import { showErrorToast } from "~Components/Base/BaseToast"
import { loadLocale } from "~i18n/i18n-util.sync"

const { vetTransaction1, account1D1, device1, firstLedgerAccount, ledgerDevice, wallet1 } = TestHelpers.data

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
    selectVthoTokenWithBalanceByAccount: jest.fn(),
    getDefaultDelegationUrl: jest.fn().mockReturnValue("https://example.com"),
}))

jest.mock("~Hooks/useSendTransaction")

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

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: () => ({
        goBack: jest.fn(),
        getState: jest.fn(),
        navigate: mockNav,
    }),
}))

jest.mock("~Components/Base/BaseToast")

const mockedVtho = {
    balance: {
        balance: "0.00",
        accountAddress: "0x0000000000000000000000000000456e65726779",
        tokenAddress: "0x0000000000000000000000000000456e65726779",
        isCustomToken: false,
    },
    decimals: 18,
    name: "VTHO",
    symbol: "VTHO",
    address: "0x0000000000000000000000000000456e65726779",
    icon: "string",
    custom: false,
    desc: undefined,
}

const mockAccount = (accountWithDevice: AccountWithDevice) => {
    // @ts-ignore
    ;(selectSelectedAccount as jest.Mock).mockReturnValue(accountWithDevice)
}

const mockVTHO = (_mockedVtho: any) => {
    // @ts-ignore
    ;(selectVthoTokenWithBalanceByAccount as jest.Mock).mockReturnValue(_mockedVtho)
}

const mockDevice = (device: BaseDevice) => {
    // @ts-ignore
    ;(selectDevice as jest.Mock).mockReturnValue(device)
}

describe("useTransactionScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
            biometrics: {},
        })
        ;(crypto.randomFillSync as jest.Mock).mockReturnValue(Buffer.from("1234abc", "hex"))
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: "0x1234" },
            status: 200,
        })
        mockAccount({
            ...account1D1,
            device: device1,
        })
        mockVTHO(mockedVtho)
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
            loadingGas: true,
            onSubmit: expect.any(Function),
            isLoading: true,
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
            isFirstTimeLoadingFees: true,
            isBiometricsEmpty: true,
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
    })
})
