import { renderHook } from "@testing-library/react-hooks"
import { useDeviceUtils } from "./useDeviceUtils"
import { selectDevices } from "~Storage/Redux/Selectors"
import { TestWrapper } from "~Test"
jest.mock("react-native-quick-crypto")

const device1 = {
    rootAddress: "0x123",
    publicKey: "pub1",
}
const device2 = {
    rootAddress: "0x456",
    publicKey: "pub2",
}
// const mnemonic =
//     "juice direct sell apart motion polar copper air novel dumb slender flash feature early feel"
jest.mock("~Storage/Redux/Selectors", () => ({
    ...jest.requireActual("~Storage/Redux/Selectors"),
    selectDevices: jest.fn(() => () => [device1, device2]),
}))

describe("useDeviceUtils", () => {
    it("should generate a new device from a given mnemonic", async () => {
        ;(selectDevices as jest.Mock).mockImplementation(() => () => [
            device1,
            device2,
        ])
        const { result, waitForNextUpdate } = renderHook(
            () => useDeviceUtils(),
            {
                wrapper: TestWrapper,
            },
        )
        await waitForNextUpdate()
        const mnemonic =
            "patrol marriage valve view dismiss history retire mystery garlic limb adult swing dilemma dynamic hungry"
        const { device, wallet } =
            result.current.getDeviceFromMnemonic(mnemonic)
        expect(device).toBeDefined()
        expect(wallet).toBeDefined()
        expect(device.rootAddress).toBeDefined()
        expect(device.xPub?.publicKey).toBeDefined()
        expect(wallet.rootAddress).toBeDefined()
        expect(wallet.mnemonic).toEqual(mnemonic.split(" "))
    })

    it("should throw with the same device", async () => {
        ;(selectDevices as jest.Mock).mockImplementation(() => () => [
            {
                alias: "Wallet 3",
                xPub: {
                    publicKey:
                        "04fffdd97df929dd320cf5357aa8db7e28a7adff109896772542bfa7aeb01bb1c9b4f4aa4ef90a1826829350b40af7c76590bcae25e02540eedd9d35ab907f8c5b",
                    chainCode:
                        "51f873b803f6dd9365c8cb176bedba927f1fef1df117aa4ab8b9cf03b12c7e90",
                },
                rootAddress: "0xf397ae6dcfb21db65ad3454c5afbb40884b78edc",
                type: "local-mnemonic",
                index: 2,
            },
        ])
        const { result, waitForNextUpdate } = renderHook(
            () => useDeviceUtils(),
            {
                wrapper: TestWrapper,
            },
        )
        await waitForNextUpdate()
        const mnemonic =
            "patrol marriage valve view dismiss history retire mystery garlic limb adult swing dilemma dynamic hungry"
        expect(() => {
            result.current.getDeviceFromMnemonic(mnemonic)
        }).toThrowError("Device already exists")
    })
})
