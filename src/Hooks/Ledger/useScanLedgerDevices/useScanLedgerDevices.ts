import { debug, error, warn } from "~Utils"
import { ConnectedLedgerDevice } from "~Model"
import { MutableRefObject, useCallback, useRef, useState } from "react"
import { Device } from "react-native-ble-plx"
import { DeviceModel } from "@ledgerhq/devices"
import { Observer as TransportObserver, Subscription as TransportSubscription } from "@ledgerhq/hw-transport"
import { HwTransportError } from "@ledgerhq/errors"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { Platform } from "react-native"

type SubscriptionEvent = {
    type: string
    descriptor: Device | null
    deviceModel: DeviceModel
}

type Props = {
    readyToScan?: boolean
    onAddDevice?: (device: ConnectedLedgerDevice) => void
    connectDevice?: () => void
}

/**
 * hook for scan available ledger devices
 */

export const useScanLedgerDevices = ({ onAddDevice, readyToScan = true }: Props) => {
    const subscription = useRef<TransportSubscription>()
    const [availableDevices, setAvailableDevices] = useState<ConnectedLedgerDevice[]>([])

    const bleObserver: MutableRefObject<TransportObserver<any, HwTransportError>> = useRef({
        complete: () => {
            debug("useScanLedgerDevices - observer - complete")
        },
        error: err => {
            warn("useScanLedgerDevices - observer", { err })
        },
        next: (e: SubscriptionEvent) => {
            if (e.type === "add") {
                const { descriptor, deviceModel } = e

                const device: ConnectedLedgerDevice = {
                    id: descriptor?.id || "",
                    isConnectable: Platform.select({
                        ios: descriptor?.isConnectable || false,
                        android: true,
                        default: false,
                    }),
                    localName: descriptor?.localName || "",
                    name: descriptor?.name || "",
                    rssi: descriptor?.rssi || 0,
                    productName: deviceModel?.productName || "",
                }

                if (device)
                    setAvailableDevices(prev => {
                        if (prev.find(d => d.id === device.id)) {
                            return prev
                        }
                        return [...prev, device]
                    })

                if (onAddDevice) onAddDevice(device)
            } else {
                error("[Ledger] - ledger added a new event, please handle it!", e)
            }
        },
    })

    const unsubscribe = useCallback(() => {
        debug("useScanLedgerDevices - unsubscribe")
        subscription.current?.unsubscribe()
        subscription.current = undefined
    }, [])

    const scanForDevices = useCallback(() => {
        if (!readyToScan) {
            debug("useScanLedgerDevices - skipping listening because not readyToScan")
            return
        }
        if (subscription.current) {
            subscription.current?.unsubscribe()
            subscription.current = undefined
        }

        debug("useScanLedgerDevices - startSubscription")

        subscription.current = BleTransport.listen(bleObserver.current)
    }, [readyToScan])

    return {
        unsubscribe,
        scanForDevices,
        availableDevices,
    }
}
