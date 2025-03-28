import { act, renderHook } from "@testing-library/react-hooks"
import { useBiometrics, useTransactionScreen, useWalletSecurity } from "~Hooks"
import { TestHelpers, TestWrapper } from "~Test"
import { Routes } from "~Navigation"
import { AccountWithDevice, BaseDevice, SecurityLevelType, TransactionRequest } from "~Model"
import crypto from "react-native-quick-crypto"
import axios from "axios"
import { waitFor } from "@testing-library/react-native"
import { Transaction } from "thor-devkit"
import { selectDevice, selectSelectedAccount, selectVthoTokenWithBalanceByAccount } from "~Storage/Redux"
import { WalletEncryptionKeyHelper } from "~Components"
import { BigNutils } from "~Utils"

const { vetTransaction1, account1D1, device1, firstLedgerAccount, ledgerDevice, wallet1 } = TestHelpers.data

const onTransactionSuccess = jest.fn()
const onTransactionFailure = jest.fn()
const mockNav = jest.fn()

jest.mock("../useBiometrics")
jest.mock("../useWalletSecurity")
jest.mock("react-native-quick-crypto")
jest.mock("axios")
jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    selectSelectedAccount: jest.fn(),
    selectDevice: jest.fn(),
    selectVthoTokenWithBalanceByAccount: jest.fn(),
    getDefaultDelegationUrl: jest.fn().mockReturnValue("https://example.com"),
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

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: () => ({
        goBack: jest.fn(),
        getState: jest.fn(),
        navigate: mockNav,
    }),
}))

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
        jest.resetAllMocks()
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
            selectedFeeOption: "0",
            gasFeeOptions: {
                "0": {
                    gasFee: "0",
                    gasRaw: BigNutils("0"),
                },
                "127": {
                    gasFee: "0",
                    gasRaw: BigNutils("0"),
                },
                "255": {
                    gasFee: "0",
                    gasRaw: BigNutils("0"),
                },
            },
            resetDelegation: expect.any(Function),
            setSelectedDelegationAccount: expect.any(Function),
            setSelectedDelegationUrl: expect.any(Function),
            isEnoughGas: false,
            txCostTotal: "0",
            isDelegated: false,
            selectedDelegationAccount: undefined,
            selectedDelegationUrl: undefined,
            vtho: {
                address: "0x0000000000000000000000000000456e65726779",
                balance: {
                    accountAddress: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                    balance: "0",
                    isCustomToken: false,
                    tokenAddress: "0x0000000000000000000000000000456e65726779",
                },
                custom: false,
                decimals: 18,
                desc: undefined,
                icon: icon,
                name: "Vethor",
                symbol: "VTHO",
            },
            isDisabledButtonState: true,
            priorityFees: {
                gasFee: "0",
                gasRaw: BigNutils("0"),
            },
        })
    })

    describe("send token transaction", () => {
        it("should submit transaction", async () => {
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

        it("should only allow submitting one transaction at a time", async () => {
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
            const accWithDevice = {
                ...firstLedgerAccount,
                device: ledgerDevice,
            }

            mockAccount(accWithDevice)

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
                        transaction: {
                            body: {
                                blockRef: "0x00ce27a27f982a6d",
                                chainTag: 39,
                                clauses: [
                                    {
                                        data: "0x",
                                        to: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68",
                                        value: "300000000000000000000",
                                    },
                                ],
                                dependsOn: null,
                                expiration: 30,
                                gas: 0,
                                gasPriceCoef: 0,
                                nonce: "0x1234ab",
                            },
                        },
                        delegationSignature: undefined,
                        dappRequest,
                    })
                },
                { timeout: 10000 },
            )
        }, 20000)
    })
})

const icon =
    // eslint-disable-next-line max-len
    "data:image/x-icon;base64,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"
