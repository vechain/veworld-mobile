import { act, renderHook } from "@testing-library/react-hooks"
import { TestHelpers } from "~Test"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { useScanLedgerDevices } from "./useScanLedgerDevices"

const { mockedDevice, mockDeviceModel, mockedTransport } = TestHelpers.data

const listenFunction = jest.fn()

describe("useScanLedgerDevices", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.mock("@ledgerhq/react-native-hw-transport-ble", () => ({
            default: mockedTransport,
        }))
        BleTransport.listen = listenFunction
    })

    it("can scan for devices", async () => {
        const { result } = renderHook(() => useScanLedgerDevices({}))

        act(() => {
            result.current.scanForDevices()
        })

        act(() => {
            listenFunction.mock.calls[0][0].next({
                type: "add",
                descriptor: mockedDevice,
                deviceModel: mockDeviceModel,
            })
        })

        expect(result.current.availableDevices).toHaveLength(1)
    })

    it("can connect", async () => {
        const { result } = renderHook(() => useScanLedgerDevices({}))

        act(() => {
            result.current.scanForDevices()
        })

        const descriptor = {
            ...mockedDevice,
            isConnectable: true,
        }

        act(() => {
            listenFunction.mock.calls[0][0].next({
                type: "add",
                descriptor,
                deviceModel: mockDeviceModel,
            })
        })

        expect(result.current.availableDevices).toHaveLength(1)
    })
})
