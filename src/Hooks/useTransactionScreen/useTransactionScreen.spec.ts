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
