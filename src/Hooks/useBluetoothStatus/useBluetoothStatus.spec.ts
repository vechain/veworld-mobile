import { renderHook } from "@testing-library/react-hooks"
import { useBluetoothStatus } from "./useBluetoothStatus"
import { State } from "react-native-ble-plx"

jest.mock("react-native-ble-plx", () => {
    return {
        ...jest.requireActual("react-native-ble-plx"),
        BleManager: jest.fn().mockImplementation(() => ({
            ...jest.requireActual("react-native-ble-plx").BleManager,
            onStateChange: jest.fn(callback => {
                callback(State.PoweredOn)
            }),
        })),
    }
})

describe("useBluetoothStatus", () => {
    it("PoweredOn - should return the correct data", () => {
        const { result } = renderHook(() => useBluetoothStatus())
        expect(result.current).toEqual({
            status: State.PoweredOn,
            isUnsupported: false,
            isAuthorized: true,
            isEnabled: true,
            isUpdating: false,
        })
    })
})
