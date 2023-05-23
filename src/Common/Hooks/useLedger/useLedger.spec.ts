import { renderHook } from "@testing-library/react-hooks"
import { useLedger } from "./useLedger"

import { TestHelpers } from "~Test"

const deviceId = "testDeviceId"

describe("useLedger", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.mock("@ledgerhq/react-native-hw-transport-ble", () => ({
            default: TestHelpers.data.mockedTransport,
        }))
    })
    it("should render correctly", async () => {
        const { result } = renderHook(() => useLedger(deviceId))

        expect(result.current).toEqual({
            vetApp: undefined,
            rootAccount: undefined,
            isError: undefined,
        })
    })
})
