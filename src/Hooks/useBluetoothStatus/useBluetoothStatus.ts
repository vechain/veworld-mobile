import { useEffect, useState } from "react"
import { BleManager, State } from "react-native-ble-plx"
import { debug } from "~Utils/Logger"

//An hook returning if BLE is supported and its current status, showing alerts if needed
export const useBluetoothStatus = () => {
    const [status, setStatus] = useState<State>(State.Unknown)

    useEffect(() => {
        const manager = new BleManager()
        manager.onStateChange(state => {
            debug("BLE state changed", state)
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
    }
}
