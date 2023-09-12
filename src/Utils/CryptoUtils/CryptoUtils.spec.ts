import { HDNode } from "thor-devkit"
import "~Test"

import CryptoUtils from "./CryptoUtils"

const { hdNodeFromXPub, verifyMnemonic, xPubFromHdNode } = CryptoUtils

// const testDevice: Device = {
//     index: 0,
//     type: DEVICE_TYPE.LOCAL_MNEMONIC,
//     alias: "test",
//     rootAddress: "0x4fec365ab34c21784b05e3fed80633268e6457ff",
//     wallet: "dfsfgsdgfs",
// }

const deviceEncryptionKey = "deviceEncryptionKey"

jest.mock("~Services/KeychainService", () => {
    return {
        setDeviceEncryptionKey: (
            _encryptionKey: string,
            _rootAddress: string,
            _accessControl?: boolean,
        ) => "setDeviceEncryptionKey is being called",
        getDeviceEncryptionKey: (
            _rootAddress: string,
            _accessControl?: boolean,
        ) => deviceEncryptionKey,
    }
})

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

describe("verifyMnemonic", () => {
    it("should create hdNode from mnemonic", () => {
        expect(
            verifyMnemonic("agent resemble equip thought unfold bring"),
        ).toBe(true)
        expect(verifyMnemonic('!@#$@%^&$%#%#{}"')).toBe(false)
    })
})
