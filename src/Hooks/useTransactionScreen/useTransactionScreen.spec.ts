import { act, renderHook } from "@testing-library/react-hooks"
import { useBiometrics, useTransactionScreen, useWalletSecurity } from "~Hooks"
import { TestHelpers, TestWrapper } from "~Test"
import { Routes } from "~Navigation"
import { DelegationType } from "~Model/Delegation"
import { AccountWithDevice, BaseDevice, SecurityLevelType } from "~Model"
import crypto from "react-native-quick-crypto"
import { CryptoUtils } from "~Utils"
import axios from "axios"
import { waitFor } from "@testing-library/react-native"
import { Transaction } from "thor-devkit"
import { selectDevice, selectSelectedAccount } from "~Storage/Redux"

const {
    vetTransaction1,
    wallet1,
    account1D1,
    device1,
    firstLedgerAccount,
    ledgerDevice,
} = TestHelpers.data

const initialRoute = Routes.HOME

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
    getDefaultDelegationUrl: jest.fn().mockReturnValue("https://example.com"),
}))
jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: () => ({
        goBack: jest.fn(),
        getState: jest.fn(),
        navigate: mockNav,
    }),
}))

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
        ;(crypto.randomFillSync as jest.Mock).mockReturnValue(
            Buffer.from("1234abc", "hex"),
        )
        jest.spyOn(CryptoUtils, "decryptWallet").mockResolvedValue({
            decryptedWallet: wallet1,
            encryptionKey: "encryptionKey",
        })
        ;(axios.post as jest.Mock).mockResolvedValueOnce({
            data: { id: "0x1234" },
            status: 200,
        })
        mockAccount({
            ...account1D1,
            device: device1,
        })
        mockDevice(device1)
    })

    it("hook should render", async () => {
        const { result } = renderHook(
            () =>
                useTransactionScreen({
                    clauses: vetTransaction1.body.clauses,
                    initialRoute,
                    onTransactionSuccess,
                    onTransactionFailure,
                }),
            {
                wrapper: TestWrapper,
            },
        )

        expect(result.current).toEqual({
            Delegation: expect.any(Function),
            SubmitButton: expect.any(Function),
            RenderGas: expect.any(Function),
            selectedDelegationOption: DelegationType.NONE,
            vthoGas: "0.00",
            vthoBalance: "0.00",
            isThereEnoughGas: true,
            onSubmit: expect.any(Function),
            isLoading: true,
            continueNotAllowed: false,
            handleClosePasswordModal: expect.any(Function),
            isPasswordPromptOpen: false,
            onPasswordSuccess: expect.any(Function),
        })
    })

    describe("send token transaction", () => {
        it("should submit transaction", async () => {
            const { result } = renderHook(
                () =>
                    useTransactionScreen({
                        clauses: vetTransaction1.body.clauses,
                        initialRoute,
                        onTransactionSuccess,
                        onTransactionFailure,
                        options: {
                            gas: 210000,
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

            const transaction: Transaction =
                onTransactionSuccess.mock.calls[0][0]

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

            const { result } = renderHook(
                () =>
                    useTransactionScreen({
                        clauses: vetTransaction1.body.clauses,
                        initialRoute,
                        onTransactionSuccess,
                        onTransactionFailure,
                        options: {
                            gas: 210000,
                        },
                    }),
                {
                    wrapper: TestWrapper,
                },
            )

            await act(async () => await result.current.onSubmit())

            await waitFor(
                () => {
                    expect(mockNav).toHaveBeenCalledWith(
                        Routes.LEDGER_SIGN_TRANSACTION,
                        {
                            accountWithDevice: accWithDevice,
                            transaction: expect.any(Transaction),
                            initialRoute: expect.any(String),
                            delegationSignature: undefined,
                        },
                    )
                },
                { timeout: 10000 },
            )
        }, 20000)
    })
})
