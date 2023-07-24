import { useLedgerSubscription } from "~Hooks"
import { renderHook } from "@testing-library/react-hooks"
import { TestHelpers } from "~Test"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"

const { mockedDevice, mockDeviceModel } = TestHelpers.data

const listenFunction = jest.fn()

describe("useLedgerSubscription", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.mock("@ledgerhq/react-native-hw-transport-ble", () => ({
            default: TestHelpers.data.mockedTransport,
        }))
        BleTransport.listen = listenFunction
    })

    it("can scan for devices", async () => {
        const { result } = renderHook(() => useLedgerSubscription({}))

        expect(result.current.canConnect).toEqual(false)

        listenFunction.mock.calls[0][0].next({
            type: "add",
            descriptor: mockedDevice,
            deviceModel: mockDeviceModel,
        })

        expect(result.current.availableDevices).toHaveLength(1)
    })

    it("can connect", async () => {
        const { result } = renderHook(() =>
            useLedgerSubscription({
                deviceId: mockedDevice.id,
            }),
        )

        const descriptor = {
            ...mockedDevice,
            isConnectable: true,
        }

        expect(result.current.canConnect).toEqual(false)

        listenFunction.mock.calls[0][0].next({
            type: "add",
            descriptor,
            deviceModel: mockDeviceModel,
        })

        expect(result.current.availableDevices).toHaveLength(1)
        expect(result.current.canConnect).toBeTruthy()
    })
})
