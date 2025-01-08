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
    "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAPYSURBVHgB5VhLaBRZFD3vVXc6MabjjOJihhl0MauBmVkMmdkZGRc6/o2CulFBDFHwA/5NsPPxh4K6EPyA6EbBha6FxNaNoKCCuIjip0KMUZN0J92d/la9533VHRFJV1dVOip46OLdqvuq6/R95977qhk8IhTGNJiYWWqekQ2YCORtNdRWZwa2/otYsfk+eIQmcVhyNNnNMXMapCnBM3RwAdMn9Ngo6slVlBCHdyyxc0rBkEsXfq9UHwYtJ+c3/4ceu/s8Eerowhp6xs92c7IpP6Rk+SP/oIMtC/AUJeCJkOBYZes3KToZH5EZu8KuhuYbbXAA14RIzLPoJy+3m5McqcobVoSgy5y2Bw7hmhCpYrWdP5v0U4R4QTfqECsOLUv1YrIICYnGYj4l5NRo4KOIKTwtR5fmHsEFXBFq7cRcGmYV8yfjlRAGL0RGXj/WkO6AS7gixDWsK+YzDQ3peIVlU3R0zuU2eABzOjF0c+pM7k+8JtM/nn+4PwiTtMOoAEpu/nl67ehjeIDjCHFf4v9iZNLxAKW5lteO4C1eySg4jlB7F+5RFtd9fl1pJtJXaxVAcHGbSbEpUFFwBgpHYZhSJSP758WH7J7jqJd1hPE3ZVfdeL5EtAoGkSLNULhZPfexZyaFimsCjIoQzwqyKfm51LM5ppJi4oTo+5uKuxiqa9MUa7JIAIyIMcuWMKxeplqH7JMmmxtaktZRAiWX7No1aN3T8ZJm/goXyCQrrCLJNGEQtX+ON+QeOrmvpKi7Z6DBLRmTljAVC1i9TEi22SkZR4SoHzXCBVS1jg9V508Eaz2xMnnBzf22S6YaKUnhFVwgEZlibT2YJk+fXBvbDpewF7VZEWTc2D2ei/JmDg0LP72mlimdCKjd4X0vZBQc16HP0R5GmDRSP3auWkekL0gZhlfpTFXd+cY3g/AAT4Ta72C2NCnzClBFcbBnGoRgPX5N1J/aMKzDIzxt8olM86fnSjeGoUWohy06MwEyCl43+YvGjORIJWID1USS7Tq7MfoEE4RrQm1dWE+D9T5m0GvOyLsaVW9azzYNXEQZ4JoQ1bodY/ZQby2yGd+R81veh1AmuCJ0KIy/KIv+UHa0v4a2q5Wdv2ztb0YZ4UrUJmDtAlXhi74NdoP7V4UYBMoIxxE63InptF4rVZ/qfz5DR9a/4NIOfRhlhuMIGQyLaZg62PtDysj45l3ep+uYBDjXEMPOKO2bo29rll/e3fsCkwRHhNpuYQ79cfD7wOtg6MoB/Sa+Nlq7+JUNJ386jm8Baguy90blOXwhlBT107uzf6vJ/UjF8AG+S3wA0e+FmfcSXdMAAAAASUVORK5CYII="
