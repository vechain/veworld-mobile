import { createHash } from "crypto"
import { Keychain } from "~Storage"
import SaltHelper from "./SaltHelper"
import WalletEncryptionKeyHelper from "./WalletEncryptionKeyHelper"

jest.mock("~Storage", () => ({
    Keychain: {
        set: jest.fn(),
        get: jest.fn(),
        deleteItem: jest.fn(),
    },
}))

jest.mock("react-native-scrypt", () => ({
    __esModule: true,
    default: jest.fn(async (password: string, salt: string) =>
        createHash("sha256").update(`${password}:${salt}`).digest("hex"),
    ),
}))

const walletA = {
    rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
    mnemonic: ["alpha"],
    nonce: "nonce-a",
}
const walletB = {
    rootAddress: "0x0000000000000000000000000000000000000001",
    mnemonic: ["bravo"],
    nonce: "nonce-b",
}

const tick = () => new Promise(resolve => setTimeout(resolve, 1))

describe("SaltHelper", () => {
    let keychain: Map<string, string>

    beforeEach(() => {
        jest.clearAllMocks()
        keychain = new Map([["WALLET_BIOMETRIC_KEY_STORAGE", JSON.stringify({ walletKey: "wallet-key" })]])
        ;(Keychain.get as jest.Mock).mockImplementation(async ({ key }) => {
            await tick()
            return keychain.get(key) ?? null
        })
        ;(Keychain.set as jest.Mock).mockImplementation(async ({ key, value }) => {
            await tick()
            keychain.set(key, value)
        })
    })

    const saltAndIVWrites = () =>
        (Keychain.set as jest.Mock).mock.calls.filter(([{ key }]) => key === "salt_and_iv").length

    it("keeps both wallets decryptable when they are encrypted concurrently on a fresh keychain", async () => {
        const [encryptedA, encryptedB] = await Promise.all([
            WalletEncryptionKeyHelper.encryptWallet(walletA),
            WalletEncryptionKeyHelper.encryptWallet(walletB),
        ])

        await expect(WalletEncryptionKeyHelper.decryptWallet({ encryptedWallet: encryptedA })).resolves.toEqual(walletA)
        await expect(WalletEncryptionKeyHelper.decryptWallet({ encryptedWallet: encryptedB })).resolves.toEqual(walletB)
        expect(saltAndIVWrites()).toBe(1)
    })

    it("retries creation after a failed keychain write", async () => {
        ;(Keychain.set as jest.Mock).mockRejectedValueOnce(new Error("keychain write failed"))

        await expect(SaltHelper.getSaltAndIV()).rejects.toThrow("keychain write failed")

        const { salt, iv } = await SaltHelper.getSaltAndIV()
        expect(keychain.get("salt_and_iv")).toBe(`salt:${salt},iv:${iv}`)
    })

    it("fails wallet encryption when salt_and_iv changes before verification", async () => {
        const original = await SaltHelper.getSaltAndIV()
        const replacement = `salt:${original.salt},iv:AAAAAAAAAAAAAAAAAAAAAA==`
        let saltAndIVReads = 0
        ;(Keychain.get as jest.Mock).mockImplementation(async ({ key }) => {
            if (key === "salt_and_iv" && ++saltAndIVReads > 1) return replacement
            return keychain.get(key) ?? null
        })

        await expect(WalletEncryptionKeyHelper.encryptWallet(walletA)).rejects.toThrow(
            "Wallet encryption verification failed",
        )
    })
})
