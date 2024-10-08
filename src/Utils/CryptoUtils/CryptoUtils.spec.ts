/* eslint-disable max-len */
import { HDNode, Keystore } from "thor-devkit"
import "~Test"

import CryptoUtils from "./CryptoUtils"
import { IMPORT_TYPE } from "~Model"
import HexUtils from "~Utils/HexUtils"
import PasswordUtils from "~Utils/PasswordUtils"
import scrypt from "react-native-scrypt"

const { hdNodeFromXPub, xPubFromHdNode, mnemonicStringToArray, decryptKeystoreFile, determineKeyImportType } =
    CryptoUtils

const VALID_MNEMONIC_12 = "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

const VALID_MNEMONIC_24 =
    "record minute play dream viable zero brisk true pink retreat juice fresh resist tent coast table damp pupil water mutual shoe year capable fluid"

const KEYSTORE_FILE =
    '{"version":3,"id":"8E39FB2F-3AE5-4DFC-849B-C78B310E6622","crypto":{"ciphertext":"ebcc42b079516d1ba5a0377743422a17d8795a1c24d3ad7b7d30dbd6c8edab12","cipherparams":{"iv":"3c3917afdf69bdc47f9693121fcc53e0"},"kdf":"scrypt","kdfparams":{"r":8,"p":1,"n":262144,"dklen":32,"salt":"ac93e95a3a6d1b070c720078625a4ccc2cef113508e2dcc9acd774325dfbe326"},"mac":"ff87134edec116091a51572a2ea745b96a169c2bae1fa09007070f3dcf4a53ec","cipher":"aes-128-ctr"},"address":"f077b491b355e64048ce21e3a6fc4751eeea77fa"}'
const KEYSTORE_ENCRY_KEY = "Password1!"
const PRIVATE_KEY = "99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36"
const PRIVATE_KEY_BASE64 = "00PQBscafudaWmgP9XaC+mA/JXxzLs7JZxWUX/GzIj+MnFJlYXMizW4Ul7esLG213TExGpuDo8xCc16LSXdZkQ=="
const PRIVATE_KEY_V2_BASE64 = "36b4d5d44b882941abd34aab0edad431a73fffed03c66d0a0859fc3d976ff446"

const deviceEncryptionKey = "deviceEncryptionKey"
const salt = HexUtils.generateRandom(256)
const iv = new Uint8Array(PasswordUtils.getIV())

jest.mock("~Services/KeychainService", () => {
    return {
        setDeviceEncryptionKey: (_encryptionKey: string, _rootAddress: string, _accessControl?: boolean) =>
            "setDeviceEncryptionKey is being called",
        getDeviceEncryptionKey: (_rootAddress: string, _accessControl?: boolean) => deviceEncryptionKey,
    }
})

jest.mock("react-native-scrypt", () => ({
    __esModule: true,

    default: jest.fn(
        async (
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
    ),
}))

// NOTE: snapshot testing
describe("xPubFromHdNode", () => {
    it("xPubFromHdNode should return XPub with correct publicKey and chainCode values", () => {
        const hdNode = HDNode.fromMnemonic(["agent", "resemble", "equip", "thought", "unfold", "bring"])
        const xPub = xPubFromHdNode(hdNode)
        expect(xPub.publicKey).toEqual(
            "0483bc762aeeedb9de996d36e23b14fc0adb856f65da5f4f369d71909b89b9e3f82638d3f14057a5092be155017100cec045841929507e3e218c4d478449e0763a",
        )
        expect(xPub.chainCode).toEqual("c1c4093fab85d89e01d7c6eb2fd247da4fc8cb0f561fead35ae3c49fcb659eb5")
    })
})

// NOTE: snapshot testing
describe("hdNodeFromXPub", () => {
    it("hdNodeFromXPub should return hdNode", () => {
        const hdNode = hdNodeFromXPub({
            publicKey:
                "0483bc762aeeedb9de996d36e23b14fc0adb856f65da5f4f369d71909b89b9e3f82638d3f14057a5092be155017100cec045841929507e3e218c4d478449e0763a",
            chainCode: "c1c4093fab85d89e01d7c6eb2fd247da4fc8cb0f561fead35ae3c49fcb659eb5",
        })
        expect(hdNode.address).toEqual("0x4fec365ab34c21784b05e3fed80633268e6457ff")
    })
})

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

describe("mnemonicStringToArray", () => {
    it("valid 12 word phrase - trailing and leading spaces", () => {
        expect(mnemonicStringToArray(` ${VALID_MNEMONIC_12} `)).toStrictEqual(VALID_MNEMONIC_12.split(" "))
    })
    it("valid 12 word phrase - double space delimited", () => {
        expect(mnemonicStringToArray(VALID_MNEMONIC_12.split(" ").join("  "))).toStrictEqual(
            VALID_MNEMONIC_12.split(" "),
        )
    })
    it("valid 12 word phrase - double space delimited with trailing and leading spaces", () => {
        expect(mnemonicStringToArray(` ${VALID_MNEMONIC_12.split(" ").join("  ")} `)).toStrictEqual(
            VALID_MNEMONIC_12.split(" "),
        )
    })
    it("valid 12 word phrase - comma delimited", () => {
        expect(mnemonicStringToArray(VALID_MNEMONIC_12.split(" ").join(", "))).toStrictEqual(
            VALID_MNEMONIC_12.split(" "),
        )
    })
    it("valid 12 word phrase - comma delimited with trailing and leading spaces", () => {
        expect(mnemonicStringToArray(` ${VALID_MNEMONIC_12.split(" ").join(", ")} `)).toStrictEqual(
            VALID_MNEMONIC_12.split(" "),
        )
    })
})

describe("random", () => {
    it("random should return a random number", () => {
        const random = CryptoUtils.random()
        expect(random).not.toBeNull()
    })
})

describe("encrypt", () => {
    it("encrypt should return an encrypted string", async () => {
        ;(scrypt as jest.Mock).mockImplementation(async () => PRIVATE_KEY_V2_BASE64)
        const encrypted = await CryptoUtils.encrypt("test", deviceEncryptionKey, salt, iv)
        expect(encrypted).not.toBeNull()
    })
})

describe("decrypt", () => {
    it("decrypt should return a decrypted string", async () => {
        ;(scrypt as jest.Mock).mockImplementation(async () => PRIVATE_KEY_V2_BASE64)
        const encrypted = await CryptoUtils.encrypt("test", deviceEncryptionKey, salt, iv)
        const decrypted = await CryptoUtils.decrypt(encrypted, deviceEncryptionKey, salt, iv)
        expect(decrypted).toEqual("test")
    })
})

describe("encryptState", () => {
    it("encryptState should return an encrypted string", () => {
        const encrypted = CryptoUtils.encryptState({ test: "Hello" }, "myKey")
        expect(encrypted).not.toBeNull()
    })
})

describe("decryptState", () => {
    it("decryptState should return a decrypted string", () => {
        const encrypted = CryptoUtils.encryptState({ test: "Hello" }, "myKey")
        const decrypted = CryptoUtils.decryptState(encrypted, "myKey")
        expect(JSON.parse(decrypted)).toEqual({ test: "Hello" })
    })
})

describe("shuffleArray", () => {
    it("shuffleArray should return a shuffled array", () => {
        const initialArray = ["VTHO", "VET", "B3TR", "VOT3", "ETH", "BTC"]
        expect(CryptoUtils.shuffleArray(initialArray)).not.toBe(initialArray)
    })
})

describe("determineKeyImportType", () => {
    it("valid 12 word mnemonic", () => {
        expect(determineKeyImportType(VALID_MNEMONIC_12)).toBe(IMPORT_TYPE.MNEMONIC)
    })

    it("valid 24 word mnemonic", () => {
        expect(determineKeyImportType(VALID_MNEMONIC_24)).toBe(IMPORT_TYPE.MNEMONIC)
    })

    it("invalid checksum 12 word mnemonic", () => {
        expect(determineKeyImportType("record minute play dream viable zero brisk true pink retreat juice fresh")).toBe(
            IMPORT_TYPE.UNKNOWN,
        )
    })

    it("valid private key", () => {
        expect(determineKeyImportType(PRIVATE_KEY)).toBe(IMPORT_TYPE.PRIVATE_KEY)
    })

    it("valid private key with hex prefix", () => {
        expect(determineKeyImportType(HexUtils.addPrefix(PRIVATE_KEY))).toBe(IMPORT_TYPE.PRIVATE_KEY)
    })

    it("valid private key with hex prefix and upper case", () => {
        expect(determineKeyImportType(HexUtils.addPrefix(PRIVATE_KEY).toUpperCase())).toBe(IMPORT_TYPE.PRIVATE_KEY)
    })

    it("valid keystore file", () => {
        expect(determineKeyImportType(KEYSTORE_FILE)).toBe(IMPORT_TYPE.KEYSTORE_FILE)
    })

    it("invalid keystore file", () => {
        expect(determineKeyImportType("invalid keystore file")).toBe(IMPORT_TYPE.UNKNOWN)
    })
})
