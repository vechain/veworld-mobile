import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { Mutex } from "async-mutex"
import { useCallback, useRef } from "react"

export const useWithTransport = () => {
    const mutex = useRef<Mutex>(new Mutex())

    /**
     * @param bleTransport - the transport to use
     * @returns a function to use the transport.
     * This will acquire a mutex before invoking the function, ensuring only 1 function is invoked at a time
     */
    const withTransport = useCallback(
        (bleTransport: BleTransport) =>
            async <T>(func: (t: BleTransport) => Promise<T>) => {
                const release = await mutex.current.acquire()
                try {
                    return await func(bleTransport)
                } finally {
                    release?.()
                }
            },
        [mutex],
    )
    return withTransport
}
