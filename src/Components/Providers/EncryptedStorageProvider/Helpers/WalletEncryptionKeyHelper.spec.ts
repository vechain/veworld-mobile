import { Keychain } from "~Storage"
import { CryptoUtils } from "~Utils"
import SaltHelper from "./SaltHelper"
import WalletEncryptionKeyHelper from "./WalletEncryptionKeyHelper"

jest.mock("~Storage", () => ({
    Keychain: {
        set: jest.fn(),
        get: jest.fn(),
        deleteItem: jest.fn(),
    },
}))

describe("WalletEncryptionKeyHelper", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
        let storedValue: string | undefined
        ;(Keychain.set as jest.Mock).mockImplementation(async ({ value }) => {
            storedValue = value
        })
        ;(Keychain.get as jest.Mock).mockImplementation(async () => storedValue)
        ;(Keychain.deleteItem as jest.Mock).mockResolvedValue(undefined)
    })

    it("commits a biometric key without a prompting read-back", async () => {
        await WalletEncryptionKeyHelper.init()

        expect(Keychain.set).toHaveBeenCalledTimes(1)
        // Reading the biometric slot back would trigger an OS auth prompt.
        expect(Keychain.get).not.toHaveBeenCalled()
        expect(Keychain.deleteItem).toHaveBeenCalledWith({ key: "WALLET_ENCRYPTION_KEY_STORAGE" })
        expect((Keychain.set as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
            (Keychain.deleteItem as jest.Mock).mock.invocationCallOrder[0],
        )
    })

    it("verifies the pin-slot ciphertext before deleting the biometric credential", async () => {
        jest.spyOn(SaltHelper, "getSaltAndIV").mockResolvedValue({ salt: "salt", iv: "AAAAAAAAAAAAAAAAAAAAAA==" })
        jest.spyOn(CryptoUtils, "encrypt").mockResolvedValue("encrypted-keys")

        await WalletEncryptionKeyHelper.init("123456")

        expect(Keychain.get).toHaveBeenCalledTimes(1)
        expect(Keychain.get).toHaveBeenCalledWith({ key: "WALLET_ENCRYPTION_KEY_STORAGE" })
        expect(Keychain.deleteItem).toHaveBeenCalledWith({ key: "WALLET_BIOMETRIC_KEY_STORAGE" })
        expect((Keychain.get as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
            (Keychain.deleteItem as jest.Mock).mock.invocationCallOrder[0],
        )
    })

    it("does not delete the biometric credential when the pin-slot read-back mismatches", async () => {
        jest.spyOn(SaltHelper, "getSaltAndIV").mockResolvedValue({ salt: "salt", iv: "AAAAAAAAAAAAAAAAAAAAAA==" })
        jest.spyOn(CryptoUtils, "encrypt").mockResolvedValue("encrypted-keys")
        ;(Keychain.get as jest.Mock).mockResolvedValue("tampered-ciphertext")

        await expect(WalletEncryptionKeyHelper.init("123456")).rejects.toThrow("Encryption key verification failed")
        expect(Keychain.deleteItem).not.toHaveBeenCalled()
    })

    it("does not delete an existing credential when writing the new key fails", async () => {
        ;(Keychain.set as jest.Mock).mockRejectedValueOnce(new Error("keychain write failed"))

        await expect(WalletEncryptionKeyHelper.init()).rejects.toThrow("keychain write failed")
        expect(Keychain.deleteItem).not.toHaveBeenCalled()
    })

    it("uses one protected keychain read to encrypt and verify a wallet", async () => {
        const wallet = {
            rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
            mnemonic: ["test"],
            nonce: "nonce",
        }
        ;(Keychain.get as jest.Mock).mockResolvedValueOnce(JSON.stringify({ walletKey: "wallet-key" }))
        jest.spyOn(SaltHelper, "getSaltAndIV").mockResolvedValue({ salt: "salt", iv: "AAAAAAAAAAAAAAAAAAAAAA==" })
        jest.spyOn(CryptoUtils, "encrypt").mockResolvedValue("encrypted-wallet")
        jest.spyOn(CryptoUtils, "decrypt").mockResolvedValue(wallet)

        await expect(WalletEncryptionKeyHelper.encryptWallet(wallet)).resolves.toBe("encrypted-wallet")

        expect(Keychain.get).toHaveBeenCalledTimes(1)
    })

    it("throws when the encrypted wallet fails round-trip verification", async () => {
        const wallet = {
            rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
            mnemonic: ["test"],
            nonce: "nonce",
        }
        ;(Keychain.get as jest.Mock).mockResolvedValueOnce(JSON.stringify({ walletKey: "wallet-key" }))
        jest.spyOn(SaltHelper, "getSaltAndIV").mockResolvedValue({ salt: "salt", iv: "AAAAAAAAAAAAAAAAAAAAAA==" })
        jest.spyOn(CryptoUtils, "encrypt").mockResolvedValue("encrypted-wallet")
        jest.spyOn(CryptoUtils, "decrypt").mockResolvedValue({
            ...wallet,
            rootAddress: "0x0000000000000000000000000000000000000000",
        })

        await expect(WalletEncryptionKeyHelper.encryptWallet(wallet)).rejects.toThrow(
            "Wallet encryption verification failed",
        )
    })
})
