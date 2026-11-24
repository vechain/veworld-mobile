import { BleError } from "react-native-ble-plx"
import { throwError } from "rxjs"
import { ignoreUnhandledBleErrors } from "./ignoreUnhandledBleErrors"

const subscribeWithoutErrorHandler = (error: unknown) => {
    throwError(() => error).subscribe()
    jest.runAllTimers()
}

describe("ignoreUnhandledBleErrors", () => {
    beforeAll(() => ignoreUnhandledBleErrors())
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it("drops a BleError that no subscriber handles", () => {
        expect(() => subscribeWithoutErrorHandler(new (BleError as any)())).not.toThrow()
    })

    it("still rethrows other unhandled errors", () => {
        expect(() => subscribeWithoutErrorHandler(new Error("boom"))).toThrow("boom")
    })
})
