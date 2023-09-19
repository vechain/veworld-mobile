import { debug, warn } from "~Utils"
import { ConnectedLedgerDevice } from "~Model"
import {
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react"
import { Device } from "react-native-ble-plx"
import { DeviceModel } from "@ledgerhq/devices"
import {
    Observer as TransportObserver,
    Subscription as TransportSubscription,
} from "@ledgerhq/hw-transport"
import { Platform } from "react-native"
import { HwTransportError } from "@ledgerhq/errors"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"

type Props = {
    readyToScan?: boolean
    deviceId?: string
    onDevice?: (device: ConnectedLedgerDevice) => void
    timeout?: number
}

type SubscriptionEvent = {
    type: string
    descriptor: Device | null
    deviceModel: DeviceModel
}
export const useLedgerSubscription = ({
    deviceId,
    onDevice,
    readyToScan = true,
    timeout,
}: Props) => {
    const subscription = useRef<TransportSubscription>()
    const [timedOut, setTimedOut] = useState<boolean>(false)
    const [canConnect, setCanConnect] = useState<boolean>(false)
    const [availableDevices, setAvailableDevices] = useState<
        ConnectedLedgerDevice[]
    >([])

    const bleObserver: MutableRefObject<
        TransportObserver<any, HwTransportError>
    > = useRef({
        complete: () => {
            debug("useLedgerSubscription - observer - complete")
        },
        error: err => {
            warn("useLedgerSubscription - observer", { err })
        },
        next: (e: SubscriptionEvent) => {
            debug("useLedgerSubscription:next", e)

            if (e.type === "add") {
                const { descriptor, deviceModel } = e

                const device: ConnectedLedgerDevice = {
                    id: descriptor?.id || "",
                    isConnectable: descriptor?.isConnectable || false,
                    localName: descriptor?.localName || "",
                    name: descriptor?.name || "",
                    rssi: descriptor?.rssi || 0,
                    productName: deviceModel?.productName || "",
                }

                if (device)
                    setAvailableDevices(prev => {
                        if (prev.find(d => d.id === device.id)) return prev
                        return [...prev, device]
                    })

                if (onDevice) onDevice(device)

                const isConnectable = Platform.select({
                    ios: descriptor?.isConnectable,
                    android: true,
                })

                if (deviceId === device.id && !!isConnectable) {
                    setCanConnect(true)
                }
            } else {
                debug("ledger - not 'add': ", e)
            }
        },
    })

    useEffect(() => {
        if (!readyToScan) return

        debug("useLedgerSubscription - startSubscription")

        subscription.current = BleTransport.listen(bleObserver.current)
    }, [readyToScan])

    useEffect(() => {
        if (timeout && deviceId) {
            setInterval(() => {
                setAvailableDevices(prev => {
                    if (!prev.some(d => d.id === deviceId)) {
                        setTimedOut(true)
                        debug(
                            "useLedgerSubscription - timedOut waiting for device",
                        )
                    }

                    return prev
                })
            }, timeout)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const unsubscribe = useCallback(() => {
        debug("useLedgerSubscription - unsubscribe")
        subscription.current?.unsubscribe()
        subscription.current = undefined
    }, [])

    return {
        availableDevices,
        canConnect,
        setCanConnect,
        unsubscribe,
        timedOut,
    }
}
