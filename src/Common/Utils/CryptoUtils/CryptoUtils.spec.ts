import { HDNode } from "thor-devkit"
import { FungibleToken } from "~Model"
import "~Test"
import {
    decrypt,
    decryptState,
    encrypt,
    encryptState,
    encryptWallet,
    hdNodeFromXPub,
    mergeTokens,
    random,
    shuffleArray,
    verifyMnemonic,
    xPubFromHdNode,
} from "./CryptoUtils"

// NOTE: snapshot testing
describe("xPubFromHdNode", () => {
    it("xPubFromHdNode should return XPub with correct publicKey and chainCode values", () => {
        const hdNode = HDNode.fromMnemonic([
            "agent",
            "resemble",
            "equip",
            "thought",
            "unfold",
            "bring",
        ])
        const xPub = xPubFromHdNode(hdNode)
        expect(xPub.publicKey).toEqual(
            "0483bc762aeeedb9de996d36e23b14fc0adb856f65da5f4f369d71909b89b9e3f82638d3f14057a5092be155017100cec045841929507e3e218c4d478449e0763a",
        )
        expect(xPub.chainCode).toEqual(
            "c1c4093fab85d89e01d7c6eb2fd247da4fc8cb0f561fead35ae3c49fcb659eb5",
        )
    })
})

// NOTE: snapshot testing
describe("hdNodeFromXPub", () => {
    it("hdNodeFromXPub should return hdNode", () => {
        const hdNode = hdNodeFromXPub({
            publicKey:
                "0483bc762aeeedb9de996d36e23b14fc0adb856f65da5f4f369d71909b89b9e3f82638d3f14057a5092be155017100cec045841929507e3e218c4d478449e0763a",
            chainCode:
                "c1c4093fab85d89e01d7c6eb2fd247da4fc8cb0f561fead35ae3c49fcb659eb5",
        })
        expect(hdNode.address).toEqual(
            "0x4fec365ab34c21784b05e3fed80633268e6457ff",
        )
    })
})

describe("these functions can't be really tested because based on mocked native modules", () => {
    it("should not throw", () => {
        random()
        const arr = [1, 2, 3, 4, 5]
        shuffleArray(arr)
        const data = { name: "Alice", age: 30 }
        const encryptionKey = "secret key"
        const encrypted = encrypt(data, encryptionKey)
        decrypt(encrypted, encryptionKey)
        const encryptedState = encryptState({ bar: "foo" }, "secret")
        decryptState(encryptedState, "secret")
        encryptWallet(
            {
                rootAddress: "0x4fec365ab34c21784b05e3fed80633268e6457ff",
                nonce: "000000",
            },
            0,
            true,
        )
        encryptWallet(
            {
                rootAddress: "0x4fec365ab34c21784b05e3fed80633268e6457ff",
                nonce: "000000",
            },
            0,
            true,
            "encryption key",
        )
    })
})

describe("verifyMnemonic", () => {
    it("should create hdNode from mnemonic", () => {
        expect(
            verifyMnemonic("agent resemble equip thought unfold bring"),
        ).toBe(true)
        expect(verifyMnemonic('!@#$@%^&$%#%#{}"')).toBe(false)
    })
})

describe("mergeTokens", () => {
    it("mergeTokens should merge two token arrays and remove duplicates based on symbol and genesisId", () => {
        const a = [
            { symbol: "ETH", genesisId: "1" },
            { symbol: "BTC", genesisId: "2" },
            { symbol: "USDT", genesisId: "3" },
        ]

        const b = [
            { symbol: "BTC", genesisId: "2" },
            { symbol: "LINK", genesisId: "4" },
            { symbol: "ETH", genesisId: "1" },
        ]

        const expectedOutput = [
            { symbol: "USDT", genesisId: "3" },
            { symbol: "BTC", genesisId: "2" },
            { symbol: "LINK", genesisId: "4" },
            { symbol: "ETH", genesisId: "1" },
        ]

        const output = mergeTokens(a as FungibleToken[], b as FungibleToken[])

        expect(output).toEqual(expectedOutput)
    })
})
