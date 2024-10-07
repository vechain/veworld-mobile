import DeviceInfo from "react-native-device-info"
import { generateDeviceForMnemonic, generateDeviceForPrivateKey, isSlowDevice } from "./DeviceUtils"
import { HDNode } from "thor-devkit"
import { CryptoUtils, HexUtils } from "~Utils"
import { DEVICE_TYPE, IMPORT_TYPE } from "~Model"
import { DerivationPath } from "~Constants"

// Mock the methods from react-native-device-info
jest.mock("react-native-device-info", () => ({
    isLowRamDevice: jest.fn(),
    getMaxMemory: jest.fn(),
    getTotalMemory: jest.fn(),
}))

const PRIVATE_KEY = "0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36"

describe("generateDeviceForMnemonic", () => {
    it("valid menemonic phrase", () => {
        const mnemonicPhrase = [
            "juice",
            "direct",
            "sell",
            "apart",
            "motion",
            "polar",
            "copper",
            "air",
            "novel",
            "dumb",
            "slender",
            "flash",
            "feature",
            "early",
            "feel",
        ]
        const deviceIndex = 1
        const hdNode = HDNode.fromMnemonic(mnemonicPhrase)
        const expectedXPub = CryptoUtils.xPubFromHdNode(hdNode)

        const result = generateDeviceForMnemonic(mnemonicPhrase, deviceIndex, "Wallet 3", undefined)

        expect(result.wallet.mnemonic).toEqual(mnemonicPhrase)
        expect(result.wallet.privateKey).toBeUndefined()
        expect(result.wallet.nonce).toHaveLength(258)
        expect(result.wallet.rootAddress).toEqual(hdNode.address)

        expect(result.device.alias).toEqual("Wallet 3")
        expect(result.device.xPub).toEqual(expectedXPub)
        expect(result.device.rootAddress).toEqual(hdNode.address)
        expect(result.device.type).toEqual(DEVICE_TYPE.LOCAL_MNEMONIC)
        expect(result.device.index).toEqual(deviceIndex)
        expect(result.device.isBuckedUp).toEqual(false)
    })

    it("valid imported menemonic phrase", () => {
        const mnemonicPhrase = [
            "juice",
            "direct",
            "sell",
            "apart",
            "motion",
            "polar",
            "copper",
            "air",
            "novel",
            "dumb",
            "slender",
            "flash",
            "feature",
            "early",
            "feel",
        ]
        const deviceIndex = 1
        const hdNode = HDNode.fromMnemonic(mnemonicPhrase)
        const expectedXPub = CryptoUtils.xPubFromHdNode(hdNode)

        const result = generateDeviceForMnemonic(
            mnemonicPhrase,
            deviceIndex,
            "Wallet 3",
            DerivationPath.VET,
            IMPORT_TYPE.MNEMONIC,
        )

        expect(result.wallet.mnemonic).toEqual(mnemonicPhrase)
        expect(result.wallet.privateKey).toBeUndefined()
        expect(result.wallet.nonce).toHaveLength(258)
        expect(result.wallet.rootAddress).toEqual(hdNode.address)

        expect(result.device.alias).toEqual("Wallet 3")
        expect(result.device.xPub).toEqual(expectedXPub)
        expect(result.device.rootAddress).toEqual(hdNode.address)
        expect(result.device.type).toEqual(DEVICE_TYPE.LOCAL_MNEMONIC)
        expect(result.device.index).toEqual(deviceIndex)
        expect(result.device.isBuckedUp).toEqual(true)
    })
})
describe("generateDeviceForPrivateKey", () => {
    it("valid private key - hex prefix", () => {
        const deviceIndex = 1

        const result = generateDeviceForPrivateKey(PRIVATE_KEY, deviceIndex, "Wallet 3")

        expect(result.wallet.mnemonic).toBeUndefined()
        expect(result.wallet.privateKey).toEqual(HexUtils.normalize(PRIVATE_KEY))
        expect(result.wallet.nonce).toHaveLength(258)
        expect(result.wallet.rootAddress).toEqual("0xf077b491b355e64048ce21e3a6fc4751eeea77fa")

        expect(result.device.alias).toEqual("Wallet 3")
        expect(result.device.xPub).toBeUndefined()
        expect(result.device.rootAddress).toEqual("0xf077b491b355e64048ce21e3a6fc4751eeea77fa")
        expect(result.device.type).toEqual(DEVICE_TYPE.LOCAL_PRIVATE_KEY)
        expect(result.device.index).toEqual(deviceIndex)
    })

    it("valid private key - hex prefix and upper case", () => {
        const deviceIndex = 1

        const result = generateDeviceForPrivateKey(PRIVATE_KEY.toUpperCase(), deviceIndex, "Wallet 3")

        expect(result.wallet.mnemonic).toBeUndefined()
        expect(result.wallet.privateKey).toEqual(HexUtils.normalize(PRIVATE_KEY))
        expect(result.wallet.nonce).toHaveLength(258)
        expect(result.wallet.rootAddress).toEqual("0xf077b491b355e64048ce21e3a6fc4751eeea77fa")

        expect(result.device.alias).toEqual("Wallet 3")
        expect(result.device.xPub).toBeUndefined()
        expect(result.device.rootAddress).toEqual("0xf077b491b355e64048ce21e3a6fc4751eeea77fa")
        expect(result.device.type).toEqual(DEVICE_TYPE.LOCAL_PRIVATE_KEY)
        expect(result.device.index).toEqual(deviceIndex)
    })

    it("valid private key - no hex prefix", () => {
        const deviceIndex = 1

        const result = generateDeviceForPrivateKey(HexUtils.removePrefix(PRIVATE_KEY), deviceIndex, "Wallet 3")

        expect(result.wallet.mnemonic).toBeUndefined()
        expect(result.wallet.privateKey).toEqual(HexUtils.normalize(PRIVATE_KEY))
        expect(result.wallet.nonce).toHaveLength(258)
        expect(result.wallet.rootAddress).toEqual("0xf077b491b355e64048ce21e3a6fc4751eeea77fa")

        expect(result.device.alias).toEqual("Wallet 3")
        expect(result.device.xPub).toBeUndefined()
        expect(result.device.rootAddress).toEqual("0xf077b491b355e64048ce21e3a6fc4751eeea77fa")
        expect(result.device.type).toEqual(DEVICE_TYPE.LOCAL_PRIVATE_KEY)
        expect(result.device.index).toEqual(deviceIndex)
    })

    it("valid private key - no hex prefix and upper case", () => {
        const deviceIndex = 1

        const result = generateDeviceForPrivateKey(
            HexUtils.removePrefix(PRIVATE_KEY).toUpperCase(),
            deviceIndex,
            "Wallet 3",
        )

        expect(result.wallet.mnemonic).toBeUndefined()
        expect(result.wallet.privateKey).toEqual(HexUtils.normalize(PRIVATE_KEY))
        expect(result.wallet.nonce).toHaveLength(258)
        expect(result.wallet.rootAddress).toEqual("0xf077b491b355e64048ce21e3a6fc4751eeea77fa")

        expect(result.device.alias).toEqual("Wallet 3")
        expect(result.device.xPub).toBeUndefined()
        expect(result.device.rootAddress).toEqual("0xf077b491b355e64048ce21e3a6fc4751eeea77fa")
        expect(result.device.type).toEqual(DEVICE_TYPE.LOCAL_PRIVATE_KEY)
        expect(result.device.index).toEqual(deviceIndex)
    })

    it("invalid private key - not hex", () => {
        const deviceIndex = 1

        expect(() => {
            generateDeviceForPrivateKey("invalid_private_key", deviceIndex, "Wallet 3")
        }).toThrow("Provided hex value is not valid")
    })

    it("invalid private key - invalid length", () => {
        const deviceIndex = 1

        expect(() => {
            generateDeviceForPrivateKey("0x1234567890", deviceIndex, "Wallet 3")
        }).toThrow("Invalid private key")
    })
})

describe("isSlowDevice", () => {
    beforeEach(() => {
        // Clear all mock calls and reset their state before each test
        jest.clearAllMocks()
    })

    it("should return true for a low RAM device", async () => {
        ;(DeviceInfo.isLowRamDevice as jest.Mock).mockReturnValue(true)

        const result = await isSlowDevice()

        expect(result).toBe(true)
    })

    it("should return true for low VM allocation", async () => {
        ;(DeviceInfo.isLowRamDevice as jest.Mock).mockReturnValue(false)
        ;(DeviceInfo.getMaxMemory as jest.Mock).mockResolvedValue(300 * 1024 * 1024) // 300 MB

        const result = await isSlowDevice()

        expect(result).toBe(true)
    })

    it("should return true for a device with less than 6GB of RAM", async () => {
        ;(DeviceInfo.isLowRamDevice as jest.Mock).mockReturnValue(false)
        ;(DeviceInfo.getMaxMemory as jest.Mock).mockResolvedValue(6000 * 1024 * 1024)
        ;(DeviceInfo.getTotalMemory as jest.Mock).mockResolvedValue(5500 * 1024 * 1024) // 5500 MB

        const result = await isSlowDevice()

        expect(result).toBe(true)
    })

    it("should return false for a normal device", async () => {
        ;(DeviceInfo.isLowRamDevice as jest.Mock).mockReturnValue(false)
        ;(DeviceInfo.getMaxMemory as jest.Mock).mockResolvedValue(7000 * 1024 * 1024)
        ;(DeviceInfo.getTotalMemory as jest.Mock).mockResolvedValue(8000 * 1024 * 1024) // 8000 MB

        const result = await isSlowDevice()

        expect(result).toBe(false)
    })

    it("should throw an error for non-numeric bytes", async () => {
        ;(DeviceInfo.isLowRamDevice as jest.Mock).mockReturnValue(false)
        ;(DeviceInfo.getMaxMemory as jest.Mock).mockResolvedValue("invalid_bytes") // Non-numeric

        await expect(isSlowDevice()).rejects.toThrow("Input must be a number")
    })
})
