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
            setNoDelegation: expect.any(Function),
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
