import { useEffect, useState } from "react"
import { BleManager, State } from "react-native-ble-plx"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils/Logger"

//An hook returning if BLE is supported and its current status
export const useBluetoothStatus = () => {
    const [status, setStatus] = useState<State>(State.Unknown)

    useEffect(() => {
        const manager = new BleManager()
        manager.onStateChange(state => {
            debug(ERROR_EVENTS.LEDGER, "BLE state changed", state)
            setStatus(state)
        })

        return () => {
            manager.destroy()
        }
    }, [])

    return {
        status,
        isUnsupported: status === State.Unsupported,
        isAuthorized: status !== State.Unauthorized,
        isEnabled: status === State.PoweredOn,
        isUpdating: status === State.Resetting || status === State.Unknown,
    }
}
