import { renderHook } from "@testing-library/react-hooks"
import { useCreateWalletWithPassword } from "./useCreateWalletWithPassword"
import {
    addDeviceAndAccounts,
    setAppLockStatus,
    setLastSecurityLevel,
    setMnemonic,
    setUserSelectedSecurity,
} from "~Storage/Redux/Actions"
import { TestWrapper } from "~Test"
import KeychainService from "~Services/KeychainService"
const device = {
    alias: "Wallet 1",
    index: 0,
    rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
    type: "local-mnemonic",
    xPub: {
        chainCode:
            "8877fc5974c5b06d1fba342d0a04799f4239b8ea9934ea319d5428cf066926be",
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
jest.mock("~Storage/Redux/Actions", () => ({
    ...jest.requireActual("~Storage/Redux/Actions"),
    addDeviceAndAccounts: jest.fn(
        jest.requireActual("~Storage/Redux/Actions").addDeviceAndAccounts,
    ),
    selectAccount: jest.fn(
        jest.requireActual("~Storage/Redux/Actions").selectAccount,
    ),
    setLastSecurityLevel: jest.fn(
        jest.requireActual("~Storage/Redux/Actions").setLastSecurityLevel,
    ),
    setUserSelectedSecurity: jest.fn(
        jest.requireActual("~Storage/Redux/Actions").setUserSelectedSecurity,
    ),
    setMnemonic: jest.fn(
        jest.requireActual("~Storage/Redux/Actions").setMnemonic,
    ),
    setAppLockStatus: jest.fn(
        jest.requireActual("~Storage/Redux/Actions").setAppLockStatus,
    ),
}))

jest.mock("../useDeviceUtils", () => ({
    useDeviceUtils: jest.fn(() => ({
        getDeviceFromMnemonic: jest.fn(() => ({
            device: device,
            wallet: wallet,
        })),
    })),
}))

describe("useCreateWalletWithPassword", () => {
    it("should create wallet with password", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useCreateWalletWithPassword(),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate()
        const onCreateWallet = result.current.onCreateWallet
        await onCreateWallet({
            mnemonic: mnemonic.join(" "),
            userPassword: "password",
            onError: undefined,
        })

        expect(addDeviceAndAccounts).toBeCalledWith({
            alias: "Wallet 1",
            index: 0,
            rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
            type: "local-mnemonic",
            wallet: '{"mnemonic":["nut","glue","card","dry","patrol","glass","rebel","carry","spatial","approve","design","blur"],"nonce":"0x37a9d367c3d4889cde7d5dd940d0be489bbc9ff0db60c6ac1c37f1b8cec99f878c82496287efd1580be497ddd557a56ce920b8e8270acee0ab5f9c231ee6b63692f78db8e8e9cc0c8bdb2819083c84ae6b9d93bf5aac9f59119722739c15dad2a86d17841793c352585875d07e8a8477f446f66f05de987b4536b07834158fff","rootAddress":"0xec954b8e81777354d0a35111d83373b9ec171c64"}',
            xPub: {
                chainCode:
                    "8877fc5974c5b06d1fba342d0a04799f4239b8ea9934ea319d5428cf066926be",
                publicKey:
                    "0494c3ff1acb0cf8e842c54a2bf109b7549d8f800895576892a4ea67eff584a427904a4b2545cf84569be87387bc5fe221c20d1ba5f23d278468faa98f54ddedbe",
            },
        })
        expect(setAppLockStatus).toBeCalledWith("UNLOCKED")
        expect(setUserSelectedSecurity).toBeCalledWith("PASSWORD")
        expect(setLastSecurityLevel).toBeCalledWith("SECRET")
        expect(setMnemonic).toBeCalledWith(undefined)
        expect(result.current.isComplete).toBe(true)
    })
    it("should throw and handle error correctly", async () => {
        jest.spyOn(
            KeychainService,
            "setDeviceEncryptionKey",
        ).mockImplementation(() => {
            throw new Error("key error")
        })
        const { result, waitForNextUpdate } = renderHook(
            () => useCreateWalletWithPassword(),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate()
        const onCreateWallet = result.current.onCreateWallet
        const onErrorMock = jest.fn()
        await onCreateWallet({
            mnemonic: mnemonic.join(" "),
            userPassword: "password",
            onError: onErrorMock,
        })
        expect(onErrorMock).toHaveBeenCalledWith(new Error("key error"))
    })
})
