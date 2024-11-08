/* eslint-disable max-len */
import { Keystore } from "thor-devkit"
import "~Test"
import CryptoUtils_Legacy from "./CryptoUtils_Legacy"
const { decryptKeystoreFile } = CryptoUtils_Legacy

const KEYSTORE_FILE =
    '{"version":3,"id":"8E39FB2F-3AE5-4DFC-849B-C78B310E6622","crypto":{"ciphertext":"ebcc42b079516d1ba5a0377743422a17d8795a1c24d3ad7b7d30dbd6c8edab12","cipherparams":{"iv":"3c3917afdf69bdc47f9693121fcc53e0"},"kdf":"scrypt","kdfparams":{"r":8,"p":1,"n":262144,"dklen":32,"salt":"ac93e95a3a6d1b070c720078625a4ccc2cef113508e2dcc9acd774325dfbe326"},"mac":"ff87134edec116091a51572a2ea745b96a169c2bae1fa09007070f3dcf4a53ec","cipher":"aes-128-ctr"},"address":"f077b491b355e64048ce21e3a6fc4751eeea77fa"}'
const KEYSTORE_ENCRY_KEY = "Password1!"
const PRIVATE_KEY = "99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36"
const PRIVATE_KEY_BASE64 = "00PQBscafudaWmgP9XaC+mA/JXxzLs7JZxWUX/GzIj+MnFJlYXMizW4Ul7esLG213TExGpuDo8xCc16LSXdZkQ=="

const deviceEncryptionKey = "deviceEncryptionKey"

jest.mock("~Services/KeychainService", () => {
    return {
        setDeviceEncryptionKey: (_encryptionKey: string, _rootAddress: string, _accessControl?: boolean) =>
            "setDeviceEncryptionKey is being called",
        getDeviceEncryptionKey: (_rootAddress: string, _accessControl?: boolean) => deviceEncryptionKey,
    }
})

jest.mock("react-native-scrypt", () => ({
    __esModule: true,

    default: async (
        _password: string,
        _salt: string,
        _N: number,
        _r: number,
        _p: number,
        _dkLen: number,
        _encoding: string,
    ) => {
        return PRIVATE_KEY_BASE64
    },
}))

describe("decryptKeystoreFile", () => {
    it("valid keystore file", async () => {
        const decrypted = await decryptKeystoreFile(JSON.parse(KEYSTORE_FILE), KEYSTORE_ENCRY_KEY)
        expect(decrypted).toEqual(PRIVATE_KEY)
    }, 20000)

    it("valid keystore string", async () => {
        const decrypted = await decryptKeystoreFile(KEYSTORE_FILE, KEYSTORE_ENCRY_KEY)
        expect(decrypted).toEqual(PRIVATE_KEY)
    }, 20000)

    it("invalid keystore file", async () => {
        const ks: Keystore = JSON.parse(KEYSTORE_FILE)
        ks.crypto = {}

        await expect(decryptKeystoreFile(ks, KEYSTORE_ENCRY_KEY)).rejects.toThrow()
    }, 20000)

    it("invalid keystore file version", async () => {
        const ks: Keystore = JSON.parse(KEYSTORE_FILE)
        ks.version = 0.1

        await expect(decryptKeystoreFile(ks, KEYSTORE_ENCRY_KEY)).rejects.toThrow()
    }, 100000)
})

describe("decrypt", () => {
    it("decrypt should return a decrypted string", () => {
        const encrypted = CryptoUtils_Legacy.encrypt("test", deviceEncryptionKey)
        const decrypted = CryptoUtils_Legacy.decrypt(encrypted, deviceEncryptionKey)
        expect(decrypted).toEqual("test")
    })
})

describe("decryptState", () => {
    it("decryptState should return a decrypted string", () => {
        const encrypted = CryptoUtils_Legacy.encryptState({ test: "Hello" }, "myKey")
        const decrypted = CryptoUtils_Legacy.decryptState(encrypted, "myKey")
        expect(JSON.parse(decrypted)).toEqual({ test: "Hello" })
    })
})
