import { Keychain } from "~Storage"
import WalletEncryptionKeyHelper from "./WalletEncryptionKeyHelper"

jest.mock("~Storage", () => ({
    Keychain: {
        set: jest.fn(),
        get: jest.fn(),
        deleteItem: jest.fn(),
    },
}))

describe("WalletEncryptionKeyHelper.init", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        let storedValue: string | undefined
        ;(Keychain.set as jest.Mock).mockImplementation(async ({ value }) => {
            storedValue = value
        })
        ;(Keychain.get as jest.Mock).mockImplementation(async () => storedValue)
        ;(Keychain.deleteItem as jest.Mock).mockResolvedValue(undefined)
    })

    it("verifies the new key before deleting the alternate credential", async () => {
        await WalletEncryptionKeyHelper.init()

        expect(Keychain.set).toHaveBeenCalledTimes(1)
        expect(Keychain.get).toHaveBeenCalledTimes(1)
        expect(Keychain.deleteItem).toHaveBeenCalledWith({ key: "WALLET_ENCRYPTION_KEY_STORAGE" })
        expect((Keychain.get as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
            (Keychain.deleteItem as jest.Mock).mock.invocationCallOrder[0],
        )
    })

    it("does not delete an existing credential when writing the new key fails", async () => {
        ;(Keychain.set as jest.Mock).mockRejectedValueOnce(new Error("keychain write failed"))

        await expect(WalletEncryptionKeyHelper.init()).rejects.toThrow("keychain write failed")
        expect(Keychain.deleteItem).not.toHaveBeenCalled()
    })
})
