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
    beforeEach(() => {
        ;(selectDevices as jest.Mock).mockImplementation(() => () => [
            device1,
            device2,
        ])
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it("should return a function to get a device from a mnemonic", async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useDeviceUtils(),
            {
                wrapper: TestWrapper,
            },
        )
        await waitForNextUpdate()

        expect(result.current.getDeviceFromMnemonic).toBeDefined()
        expect(typeof result.current.getDeviceFromMnemonic).toBe("function")
    })
    // TODO: understad why this test fails
    // it("should generate a new device from a given mnemonic", async () => {
    //     const { result, waitForNextUpdate } = renderHook(
    //         () => useDeviceUtils(),
    //         {
    //             wrapper: TestWrapper,
    //         },
    //     )
    //     await waitForNextUpdate()

    //     const { device, wallet } =
    //         result.current.getDeviceFromMnemonic(mnemonic)

    //     expect(device).toBeDefined()
    //     expect(wallet).toBeDefined()
    //     expect(device.rootAddress).toBeDefined()
    //     expect(device.xPub?.publicKey).toBeDefined()
    //     expect(wallet.rootAddress).toBeDefined()
    //     expect(wallet.mnemonic).toBe(mnemonic)
    // })
})
