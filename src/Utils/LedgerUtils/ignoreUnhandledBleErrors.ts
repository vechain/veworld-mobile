import { BleError } from "react-native-ble-plx"

// The Ledger BLE transport subscribes to device notifications without an error handler, so the BleError a
// disconnect raises on them would reach RxJS's default handler, which rethrows it and crashes the app.
// `require` resolves the same RxJS build as the transport's own `require`; an `import` gets a separate copy.
const { config }: typeof import("rxjs") = require("rxjs")

export const ignoreUnhandledBleErrors = () => {
    config.onUnhandledError = err => {
        if (err instanceof BleError) return
        throw err
    }
}
