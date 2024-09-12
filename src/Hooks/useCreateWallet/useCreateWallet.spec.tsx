/* eslint-disable max-len */
import { renderHook } from "@testing-library/react-hooks"
import { waitFor } from "@testing-library/react-native"
import { addDeviceAndAccounts, addLedgerDeviceAndAccounts, setMnemonic } from "~Storage/Redux"
import { TestWrapper } from "~Test"
import { useCreateWallet } from "./useCreateWallet"
import { IMPORT_TYPE, NewLedgerDevice } from "~Model"
import { WalletEncryptionKeyHelper } from "~Components"
import { DerivationPath } from "~Constants"

const device = {
    alias: "Wallet 1",
    index: 0,
    rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
    type: "local-mnemonic",
    xPub: {
        chainCode: "8877fc5974c5b06d1fba342d0a04799f4239b8ea9934ea319d5428cf066926be",
        publicKey:
            "0494c3ff1acb0cf8e842c54a2bf109b7549d8f800895576892a4ea67eff584a427904a4b2545cf84569be87387bc5fe221c20d1ba5f23d278468faa98f54ddedbe",
    },
}

const mnemonic = [
    "nut",
    "glue",
    "card",
    "dry",
    "patrol",
    "glass",
    "rebel",
    "carry",
    "spatial",
    "approve",
    "design",
    "blur",
]
const wallet = {
    mnemonic,
    nonce: "0x37a9d367c3d4889cde7d5dd940d0be489bbc9ff0db60c6ac1c37f1b8cec99f878c82496287efd1580be497ddd557a56ce920b8e8270acee0ab5f9c231ee6b63692f78db8e8e9cc0c8bdb2819083c84ae6b9d93bf5aac9f59119722739c15dad2a86d17841793c352585875d07e8a8477f446f66f05de987b4536b07834158fff",
    rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
}

const ledger: NewLedgerDevice = {
    rootAccount: {
        publicKey: "string",
        address: "string",
        chainCode: "string",
    },
    deviceId: "test",
    alias: "string",
    accounts: [1, 3, 4],
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

jest.mock("../useDeviceUtils", () => ({
    useDeviceUtils: jest.fn(() => ({
        createDevice: jest.fn(() => ({
            device,
            wallet,
        })),
    })),
}))

jest.mock("../useBiometrics", () => ({
    useBiometrics: jest.fn(() => ({
        accessControl: true,
    })),
}))

jest.mock("~Storage/Redux/Actions", () => ({
    ...jest.requireActual("~Storage/Redux/Actions"),
    addDeviceAndAccounts: jest.fn(jest.requireActual("~Storage/Redux/Actions").addDeviceAndAccounts),
    setSelectedAccount: jest.fn(jest.requireActual("~Storage/Redux/Actions").setSelectedAccount),
    setUserSelectedSecurity: jest.fn(jest.requireActual("~Storage/Redux/Actions").setUserSelectedSecurity),
    setMnemonic: jest.fn(jest.requireActual("~Storage/Redux/Actions").setMnemonic),
    addLedgerDeviceAndAccounts: jest.fn(jest.requireActual("~Storage/Redux/Actions").addLedgerDeviceAndAccounts),
}))

jest.mock("~Storage/Redux/Selectors", () => ({
    ...jest.requireActual("~Storage/Redux/Selectors"),
    selectSelectedAccount: jest.fn(),
}))

describe("useCreateWallet", () => {
    beforeEach(() => {
        ;(WalletEncryptionKeyHelper.encryptWallet as jest.Mock).mockResolvedValue(JSON.stringify(wallet))
    })

    describe("createLocalWallet", () => {
        it("should create a wallet with biometrics", async () => {
            const { result } = renderHook(() => useCreateWallet(), {
                wrapper: TestWrapper,
            })
            const { createLocalWallet } = result.current

            await createLocalWallet({
                mnemonic: mnemonic,
                derivationPath: DerivationPath.VET,
                importType: IMPORT_TYPE.MNEMONIC,
            })
            await waitFor(() => result.current.isComplete)
            expect(result.current.accessControl).toBe(true)
            expect(result.current.isComplete).toBe(true)
            expect(addDeviceAndAccounts).toHaveBeenCalledWith({
                alias: "Wallet 1",
                index: 0,
                rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
                type: "local-mnemonic",
                wallet: '{"mnemonic":["nut","glue","card","dry","patrol","glass","rebel","carry","spatial","approve","design","blur"],"nonce":"0x37a9d367c3d4889cde7d5dd940d0be489bbc9ff0db60c6ac1c37f1b8cec99f878c82496287efd1580be497ddd557a56ce920b8e8270acee0ab5f9c231ee6b63692f78db8e8e9cc0c8bdb2819083c84ae6b9d93bf5aac9f59119722739c15dad2a86d17841793c352585875d07e8a8477f446f66f05de987b4536b07834158fff","rootAddress":"0xec954b8e81777354d0a35111d83373b9ec171c64"}',
                xPub: {
                    chainCode: "8877fc5974c5b06d1fba342d0a04799f4239b8ea9934ea319d5428cf066926be",
                    publicKey:
                        "0494c3ff1acb0cf8e842c54a2bf109b7549d8f800895576892a4ea67eff584a427904a4b2545cf84569be87387bc5fe221c20d1ba5f23d278468faa98f54ddedbe",
                },
            })
        })

        it("should create wallet with password", async () => {
            const { result } = renderHook(() => useCreateWallet(), {
                wrapper: TestWrapper,
            })
            const { createLocalWallet } = result.current
            await createLocalWallet({
                mnemonic: mnemonic,
                userPassword: "password",
                onError: undefined,
                derivationPath: DerivationPath.VET,
                importType: IMPORT_TYPE.MNEMONIC,
            })

            expect(addDeviceAndAccounts).toHaveBeenCalledWith({
                alias: "Wallet 1",
                index: 0,
                rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
                type: "local-mnemonic",
                wallet: '{"mnemonic":["nut","glue","card","dry","patrol","glass","rebel","carry","spatial","approve","design","blur"],"nonce":"0x37a9d367c3d4889cde7d5dd940d0be489bbc9ff0db60c6ac1c37f1b8cec99f878c82496287efd1580be497ddd557a56ce920b8e8270acee0ab5f9c231ee6b63692f78db8e8e9cc0c8bdb2819083c84ae6b9d93bf5aac9f59119722739c15dad2a86d17841793c352585875d07e8a8477f446f66f05de987b4536b07834158fff","rootAddress":"0xec954b8e81777354d0a35111d83373b9ec171c64"}',
                xPub: {
                    chainCode: "8877fc5974c5b06d1fba342d0a04799f4239b8ea9934ea319d5428cf066926be",
                    publicKey:
                        "0494c3ff1acb0cf8e842c54a2bf109b7549d8f800895576892a4ea67eff584a427904a4b2545cf84569be87387bc5fe221c20d1ba5f23d278468faa98f54ddedbe",
                },
            })
            expect(setMnemonic).toHaveBeenCalledWith(undefined)
            expect(result.current.isComplete).toBe(true)
        })
    })

    describe("createLedgerWallet", () => {
        it("should create wallet with Ledger", async () => {
            const { result } = renderHook(() => useCreateWallet(), {
                wrapper: TestWrapper,
            })
            const { createLedgerWallet } = result.current

            try {
                await createLedgerWallet({
                    newLedger: ledger,
                    onError: undefined,
                })
            } catch (e) {}

            expect(addLedgerDeviceAndAccounts).toHaveBeenCalledWith(ledger)
        })
    })
})
