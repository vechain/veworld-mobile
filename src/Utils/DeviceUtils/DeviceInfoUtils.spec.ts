import DeviceInfo from "react-native-device-info"
import { isSlowDevice } from "./DeviceInfoUtils" // Replace with the actual path to your module

// Mock the methods from react-native-device-info
jest.mock("react-native-device-info", () => ({
    isLowRamDevice: jest.fn(),
    getMaxMemory: jest.fn(),
    getTotalMemory: jest.fn(),
}))

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
        ;(DeviceInfo.getMaxMemory as jest.Mock).mockResolvedValue(
            300 * 1024 * 1024,
        ) // 300 MB

        const result = await isSlowDevice()

        expect(result).toBe(true)
    })

    it("should return true for a device with less than 6GB of RAM", async () => {
        ;(DeviceInfo.isLowRamDevice as jest.Mock).mockReturnValue(false)
        ;(DeviceInfo.getMaxMemory as jest.Mock).mockResolvedValue(
            6000 * 1024 * 1024,
        )
        ;(DeviceInfo.getTotalMemory as jest.Mock).mockResolvedValue(
            5500 * 1024 * 1024,
        ) // 5500 MB

        const result = await isSlowDevice()

        expect(result).toBe(true)
    })

    it("should return false for a normal device", async () => {
        ;(DeviceInfo.isLowRamDevice as jest.Mock).mockReturnValue(false)
        ;(DeviceInfo.getMaxMemory as jest.Mock).mockResolvedValue(
            7000 * 1024 * 1024,
        )
        ;(DeviceInfo.getTotalMemory as jest.Mock).mockResolvedValue(
            8000 * 1024 * 1024,
        ) // 8000 MB

        const result = await isSlowDevice()

        expect(result).toBe(false)
    })

    it("should throw an error for non-numeric bytes", async () => {
        ;(DeviceInfo.isLowRamDevice as jest.Mock).mockReturnValue(false)
        ;(DeviceInfo.getMaxMemory as jest.Mock).mockResolvedValue(
            "invalid_bytes",
        ) // Non-numeric

        await expect(isSlowDevice()).rejects.toThrow("Input must be a number")
    })
})
