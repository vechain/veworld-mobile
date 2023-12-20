import { debug, error, warn } from "~Utils"
import { ConnectedLedgerDevice } from "~Model"
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react"
import { Device } from "react-native-ble-plx"
import { DeviceModel } from "@ledgerhq/devices"
import { Observer as TransportObserver, Subscription as TransportSubscription } from "@ledgerhq/hw-transport"
import { Platform } from "react-native"
import { HwTransportError } from "@ledgerhq/errors"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"

let OutsideRenderLoopAvailableDevices = [] as ConnectedLedgerDevice[]

type Props = {
    deviceId?: string
    readyToScan?: boolean
    onAddDevice?: (device: ConnectedLedgerDevice) => void
    timeout?: number
    connectDevice?: () => void
}

type SubscriptionEvent = {
    type: string
    descriptor: Device | null
    deviceModel: DeviceModel
}

/**
 * hook for scan available ledger devices
 */

export const useLedgerSubscription = ({
    deviceId,
    onAddDevice,
    readyToScan = true,
    timeout = 5000,
    connectDevice,
}: Props) => {
    const subscription = useRef<TransportSubscription>()
    const [availableDevices, setAvailableDevices] = useState<ConnectedLedgerDevice[]>([])

    const bleObserver: MutableRefObject<TransportObserver<any, HwTransportError>> = useRef({
        complete: () => {
            debug("useLedgerSubscription - observer - complete")
        },
        error: err => {
            warn("useLedgerSubscription - observer", { err })
        },
        next: (e: SubscriptionEvent) => {
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
                        if (prev.find(d => d.id === device.id)) {
                            OutsideRenderLoopAvailableDevices = [...prev]
                            return prev
                        }
                        OutsideRenderLoopAvailableDevices = [...prev, device]
                        return [...prev, device]
                    })

                if (onAddDevice) onAddDevice(device)

                const isConnectable = Platform.select({
                    ios: descriptor?.isConnectable,
                    android: true,
                })

                if (deviceId === device.id && !!isConnectable) {
                    connectDevice?.()
                }
            } else {
                error("[Ledger] - ledger added a new event, please handle it!", e)
            }
        },
    })

    const unsubscribe = useCallback(() => {
        debug("useLedgerSubscription - unsubscribe")
        subscription.current?.unsubscribe()
        subscription.current = undefined
    }, [])

    const scanForDevices = useCallback(() => {
        if (!readyToScan) {
            debug("useLedgerSubscription - skipping listening because not readyToScan")
            return
        }
        if (subscription.current) {
            subscription.current?.unsubscribe()
            subscription.current = undefined
        }

        debug("useLedgerSubscription - startSubscription")

        subscription.current = BleTransport.listen(bleObserver.current)
    }, [readyToScan])

    // polling to search for the devices
    // if deviceId is present it searches for related device, if not found, it unsubscribes and scans again
    const checkDevicePresence = useCallback(() => {
        const isPresent = OutsideRenderLoopAvailableDevices.some(d => d.id === deviceId)
        if (isPresent) {
            connectDevice?.()
        } else {
            debug("useLedgerSubscription - timedOut waiting for device", {
                deviceId,
                OutsideRenderLoopAvailableDevices,
            })
            scanForDevices()
            setTimeout(checkDevicePresence, timeout)
        }
    }, [connectDevice, deviceId, scanForDevices, timeout])

    useEffect(() => {
        if (deviceId) {
            checkDevicePresence()
        } else {
            scanForDevices()
        }
    }, [checkDevicePresence, deviceId, scanForDevices])

    return {
        availableDevices,
        unsubscribe,
    }
}
