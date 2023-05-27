import { renderHook } from "@testing-library/react-hooks"
import { useLedger } from "./useLedger"

import { TestHelpers } from "~Test"
import { act } from "@testing-library/react-native"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { LEDGER_ERROR_CODES } from "~Common/Ledger"

jest.mock("@ledgerhq/react-native-hw-transport-ble")

const deviceId = "testDeviceId"
const waitFirstManualConnection = false
const onConnectionError = jest.fn()
//TODO - test succesfully connection (mock send method in transport), checkLedgerConnection called with timeout

describe("useLedger", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.mock("@ledgerhq/react-native-hw-transport-ble", () => ({
            default: TestHelpers.data.mockedTransport,
        }))
    })
    describe("waitFirstManualConnection", () => {
        it("works correctly on first call", async () => {
            const { result } = renderHook(() =>
                useLedger({
                    deviceId,
                    waitFirstManualConnection,
                    onConnectionError,
                }),
            )

            expect(result.current).toEqual({
                vetApp: undefined,
                rootAccount: undefined,
                isConnecting: false,
                errorCode: undefined,
                openOrFinalizeConnection: expect.any(Function),
                setTimerEnabled: expect.any(Function),
            })
        })

        it("call openOrFinalizeConnection - disconnected", async () => {
            jest.spyOn(BleTransport, "open").mockImplementation(async () => {
                throw new Error("test error")
            })

            const { result, waitForNextUpdate } = renderHook(() =>
                useLedger({
                    deviceId,
                    waitFirstManualConnection,
                    onConnectionError,
                }),
            )

            act(async () => {
                await result.current.openOrFinalizeConnection()
            })
            await waitForNextUpdate({ timeout: 2000 })
            expect(onConnectionError).toHaveBeenCalledWith(
                LEDGER_ERROR_CODES.DISCONNECTED,
            )

            expect(result.current).toEqual({
                vetApp: undefined,
                rootAccount: undefined,
                isConnecting: false,
                errorCode: LEDGER_ERROR_CODES.DISCONNECTED,
                openOrFinalizeConnection: expect.any(Function),
                setTimerEnabled: expect.any(Function),
            })
        })
        it("call openOrFinalizeConnection - unknown error on getAppConfig", async () => {
            jest.spyOn(BleTransport, "open").mockImplementation(async () => {
                return TestHelpers.data.mockedTransport
            })

            const { result, waitForNextUpdate } = renderHook(() =>
                useLedger({
                    deviceId,
                    waitFirstManualConnection,
                    onConnectionError,
                }),
            )

            act(async () => {
                await result.current.openOrFinalizeConnection()
            })
            await waitForNextUpdate({ timeout: 2000 })
            expect(onConnectionError).toHaveBeenCalledWith(
                LEDGER_ERROR_CODES.UNKNOWN,
            )
            expect(result.current).toEqual({
                vetApp: undefined,
                rootAccount: undefined,
                isConnecting: false,
                errorCode: LEDGER_ERROR_CODES.UNKNOWN,
                openOrFinalizeConnection: expect.any(Function),
                setTimerEnabled: expect.any(Function),
            })
        })
    })
})
