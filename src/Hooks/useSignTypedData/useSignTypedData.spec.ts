import { renderHook } from "@testing-library/react-hooks"
import { WalletEncryptionKeyHelper } from "~Components"
import { LedgerDevice, LocalDevice, TypedData, WalletAccount } from "~Model"
import TestData from "../../Test/helpers"
import { useSignTypedMessage } from "./useSignTypedData"
import { TestWrapper } from "~Test"
import { selectDevice, selectSelectedAccount } from "~Storage/Redux"

const { account1D1, wallet1, keystoreDevice, firstLedgerAccount, ledgerDevice, device1 } = TestData.data

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    selectSelectedAccount: jest.fn(),
    selectDevice: jest.fn(),
}))

jest.mock("~Services/KeychainService/KeychainService", () => ({
    ...jest.requireActual("~Services/KeychainService/KeychainService"),
    getDeviceEncryptionKey: jest.fn().mockResolvedValue("ac4a45eaa86188615088082c1dee1547"),
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

const mockDevice = (device: LocalDevice | LedgerDevice) => {
    // @ts-ignore
    ;(selectDevice as jest.Mock).mockReturnValue(device)
}

const mockAccount = (account: WalletAccount) => {
    // @ts-ignore
    ;(selectSelectedAccount as jest.Mock).mockReturnValue(account)
}

const typedDataMock: TypedData = {
    domain: {
        name: "Ether Mail",
        version: "1",
        chainId: 123,
        verifyingContract: "0x1CAB02Ec1922F1a5a55996de8c590161A88378b9",
    },
    types: {
        Person: [
            { name: "name", type: "string" },
            { name: "wallet", type: "address" },
        ],
        Mail: [
            { name: "from", type: "Person" },
            { name: "to", type: "Person" },
            { name: "contents", type: "string" },
        ],
    },
    primaryType: "Mail",
    value: {
        from: {
            name: "Cow",
            wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
            name: "Bob",
            wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
    },
    timestamp: Date.now(),
    signer: account1D1.address,
}

describe("useSignTypedData", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(WalletEncryptionKeyHelper.decryptWallet as jest.Mock).mockResolvedValue(wallet1)
    })

    it("should render correctly", async () => {
        mockAccount(account1D1)
        mockDevice(keystoreDevice)

        const { result } = renderHook(
            () =>
                useSignTypedMessage({
                    typedData: typedDataMock,
                }),
            { wrapper: TestWrapper },
        )
        expect(result.current).toEqual({
            signTypedData: expect.any(Function),
        })

        const signature = await result.current.signTypedData()

        await expect(signature?.length).toBe(132)
    })

    it("should work with keystore wallet", async () => {
        mockAccount(account1D1)
        mockDevice(keystoreDevice)

        const { result } = renderHook(
            () =>
                useSignTypedMessage({
                    typedData: typedDataMock,
                }),
            { wrapper: TestWrapper },
        )
        expect(result.current).toEqual({
            signTypedData: expect.any(Function),
        })

        const signature = await result.current.signTypedData()

        await expect(signature?.length).toBe(132)
    })

    it("should throw with ledger type account", async () => {
        mockAccount(firstLedgerAccount)
        mockDevice(ledgerDevice)

        const { result } = renderHook(
            () =>
                useSignTypedMessage({
                    typedData: typedDataMock,
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current).toEqual({
            signTypedData: expect.any(Function),
        })

        await expect(result.current.signTypedData()).rejects.toThrow("Ledger devices not supported")
    })

    it("no wallet should throw error", async () => {
        mockAccount(account1D1)
        mockDevice({
            ...device1,
            wallet: "",
        })

        const { result } = renderHook(
            () =>
                useSignTypedMessage({
                    typedData: typedDataMock,
                }),

            { wrapper: TestWrapper },
        )

        expect(result.current).toEqual({
            signTypedData: expect.any(Function),
        })

        await expect(result.current.signTypedData()).rejects.toThrow("The device doesn't have a wallet")
    })
})
