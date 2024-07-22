/* eslint-disable max-len */
import { renderHook } from "@testing-library/react-hooks"
import { useDeviceUtils } from "./useDeviceUtils"
import { selectDevices } from "~Storage/Redux/Selectors"
import { TestWrapper } from "~Test"
import { DEVICE_CREATION_ERRORS as ERRORS } from "~Model"
import { HexUtils } from "~Utils"

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
    selectDevices: jest.fn(() => [device1, device2]),
}))

describe("createDevice", () => {
    it("should generate a new device from a given mnemonic", async () => {
        ;(selectDevices as unknown as jest.Mock).mockImplementation(() => [device1, device2])
        const { result: hook } = renderHook(() => useDeviceUtils(), {
            wrapper: TestWrapper,
        })

        const mnemonic =
            "patrol marriage valve view dismiss history retire mystery garlic limb adult swing dilemma dynamic hungry".split(
                " ",
            )
        const { device, wallet } = hook.current.createDevice(false, mnemonic)
        expect(device).toBeDefined()
        expect(wallet).toBeDefined()
        expect(device.rootAddress).toBeDefined()
        expect(device.xPub?.publicKey).toBeDefined()
        expect(wallet.rootAddress).toBeDefined()
        expect(wallet.mnemonic).toEqual(mnemonic)
        expect(wallet.privateKey).toBeUndefined()
    })

    it("should generate a new device from a given private key", async () => {
        ;(selectDevices as unknown as jest.Mock).mockImplementation(() => [device1, device2])
        const { result: hook } = renderHook(() => useDeviceUtils(), {
            wrapper: TestWrapper,
        })

        const privateKey = "99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36"
        const { device, wallet } = hook.current.createDevice(false, undefined, privateKey)
        expect(device).toBeDefined()
        expect(wallet).toBeDefined()
        expect(device.rootAddress).toBeDefined()
        expect(device.xPub).toBeUndefined()
        expect(wallet.rootAddress).toBeDefined()
        expect(wallet.privateKey).toEqual(HexUtils.normalize(privateKey))
        expect(wallet.mnemonic).toBeUndefined()
    })

    it("should throw with the same device", async () => {
        ;(selectDevices as unknown as jest.Mock).mockImplementation(() => [
            {
                alias: "Wallet 3",
                xPub: {
                    publicKey:
                        "04fffdd97df929dd320cf5357aa8db7e28a7adff109896772542bfa7aeb01bb1c9b4f4aa4ef90a1826829350b40af7c76590bcae25e02540eedd9d35ab907f8c5b",
                    chainCode: "51f873b803f6dd9365c8cb176bedba927f1fef1df117aa4ab8b9cf03b12c7e90",
                },
                rootAddress: "0xf397ae6dcfb21db65ad3454c5afbb40884b78edc",
                type: "local-mnemonic",
                index: 2,
            },
        ])
        const { result } = renderHook(() => useDeviceUtils(), {
            wrapper: TestWrapper,
        })

        const mnemonic =
            "patrol marriage valve view dismiss history retire mystery garlic limb adult swing dilemma dynamic hungry".split(
                " ",
            )
        expect(() => {
            result.current.createDevice(false, mnemonic)
        }).toThrowError(ERRORS.ADDRESS_EXISTS)
    })
})
