import { renderHook } from "@testing-library/react-hooks"
import { useLedger } from "."

import { TestHelpers } from "~Test"
import { act } from "@testing-library/react-native"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { useLedgerSubscription } from "~Hooks"
import { LedgerConfig } from "~Utils/LedgerUtils/LedgerUtils"
import { LEDGER_ERROR_CODES } from "~Constants"

jest.mock("@ledgerhq/react-native-hw-transport-ble")
jest.mock("~Hooks/useLedgerSubscription/useLedgerSubscription")

const deviceId = "testDeviceId"

describe("useLedger", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.mock("@ledgerhq/react-native-hw-transport-ble", () => ({
            default: TestHelpers.data.mockedTransport,
        }))
        ;(
            useLedgerSubscription as jest.MockedFunction<
                typeof useLedgerSubscription
            >
        ).mockReturnValue({
            canConnect: true,
            availableDevices: [],
            unsubscribe: jest.fn(),
        })
    })
    describe("waitFirstManualConnection", () => {
        it("works correctly on first call", async () => {
            const { result } = renderHook(() =>
                useLedger({
                    deviceId,
                    autoConnect: false,
                }),
            )

            expect(result.current).toEqual({
                appOpen: false,
                appConfig: LedgerConfig.UNKNOWN,
                rootAccount: undefined,
                errorCode: undefined,
                tryLedgerConnection: expect.any(Function),
                tryLedgerVerification: expect.any(Function),
                isConnecting: false,
                removeLedger: expect.any(Function),
                withTransport: undefined,
            })
        })

        it("call openOrFinalizeConnection - disconnected", async () => {
            jest.spyOn(BleTransport, "open").mockImplementation(async () => {
                throw new Error("test error")
            })

            const { result, waitForNextUpdate } = renderHook(() =>
                useLedger({
                    deviceId,
                    autoConnect: false,
                }),
            )

            act(async () => {
                await result.current.tryLedgerConnection()
            })
            await waitForNextUpdate({ timeout: 5000 })

            expect(result.current).toEqual({
                appOpen: false,
                appConfig: LedgerConfig.UNKNOWN,
                rootAccount: undefined,
                errorCode: LEDGER_ERROR_CODES.UNKNOWN,
                tryLedgerConnection: expect.any(Function),
                tryLedgerVerification: expect.any(Function),
                isConnecting: false,
                removeLedger: expect.any(Function),
                withTransport: undefined,
            })
        })
        it("call openOrFinalizeConnection - unknown error on getAppConfig", async () => {
            jest.spyOn(BleTransport, "open").mockImplementation(async () => {
                return TestHelpers.data.mockedTransport
            })

            const { result, waitForNextUpdate } = renderHook(() =>
                useLedger({
                    deviceId,
                    autoConnect: false,
                }),
            )

            act(async () => {
                await result.current.tryLedgerConnection()
            })
            await waitForNextUpdate({ timeout: 5000 })

            expect(result.current).toEqual({
                appOpen: false,
                appConfig: LedgerConfig.UNKNOWN,
                rootAccount: undefined,
                errorCode: LEDGER_ERROR_CODES.UNKNOWN,
                tryLedgerConnection: expect.any(Function),
                tryLedgerVerification: expect.any(Function),
                isConnecting: false,
                removeLedger: expect.any(Function),
                withTransport: undefined,
            })
        })
    })
})
