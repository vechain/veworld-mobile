import { TestWrapper } from "~Test"
import { useSignMessage } from "./useSignMessage"
import { renderHook } from "@testing-library/react-hooks"
import { blake2b256 } from "thor-devkit"
import { selectDevice, selectSelectedAccount } from "~Storage/Redux"
import TestData from "../../Test/helpers"
import { LedgerDevice, LocalDevice, WalletAccount } from "~Model"

const { firstLedgerAccount, ledgerDevice, account1D1, device1 } = TestData.data

jest.mock("axios")

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
    showWarningToast: jest.fn(),
}))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    selectSelectedAccount: jest.fn(),
    selectDevice: jest.fn(),
}))

jest.mock("~Services/KeychainService/KeychainService", () => ({
    ...jest.requireActual("~Services/KeychainService/KeychainService"),
    getDeviceEncryptionKey: jest
        .fn()
        .mockResolvedValue("ac4a45eaa86188615088082c1dee1547"),
}))

const mockDevice = (device: LocalDevice | LedgerDevice) => {
    // @ts-ignore
    ;(selectDevice as jest.Mock).mockReturnValue(device)
}

const mockAccount = (account: WalletAccount) => {
    // @ts-ignore
    ;(selectSelectedAccount as jest.Mock).mockReturnValue(account)
}

const messageToSign = blake2b256("message to sign")

describe("useSignMessage", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", async () => {
        mockAccount(account1D1)
        mockDevice(device1)

        const { result } = renderHook(
            () =>
                useSignMessage({
                    hash: messageToSign,
                }),
            { wrapper: TestWrapper },
        )
        expect(result.current).toEqual({
            signMessage: expect.any(Function),
        })

        const signature = await result.current.signMessage()

        await expect(signature?.length).toBe(65)
    })

    it("ledger type account", async () => {
        mockAccount(firstLedgerAccount)
        mockDevice(ledgerDevice)

        const { result } = renderHook(
            () =>
                useSignMessage({
                    hash: messageToSign,
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current).toEqual({
            signMessage: expect.any(Function),
        })

        await expect(result.current.signMessage()).rejects.toThrow(
            "Ledger devices not supported in this hook",
        )
    })

    it("no wallet should throw error", async () => {
        mockAccount(account1D1)
        mockDevice({
            ...device1,
            wallet: "",
        })

        const { result } = renderHook(
            () =>
                useSignMessage({
                    hash: messageToSign,
                }),

            { wrapper: TestWrapper },
        )

        expect(result.current).toEqual({
            signMessage: expect.any(Function),
        })

        await expect(result.current.signMessage()).rejects.toThrow(
            "The device doesn't have a wallet",
        )
    })
})
