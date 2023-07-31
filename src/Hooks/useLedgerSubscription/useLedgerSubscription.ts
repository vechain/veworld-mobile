import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { debug, PlatformUtils } from "~Utils"
import { ConnectedLedgerDevice } from "~Model"
import { useCallback, useEffect, useRef, useState } from "react"
import { Device } from "react-native-ble-plx"
import { DeviceModel } from "@ledgerhq/devices"
import { Subscription as TransportSubscription } from "@ledgerhq/hw-transport"
import { Platform } from "react-native"

type Props = {
    deviceId?: string
    onDevice?: (device: ConnectedLedgerDevice) => void
}

type SubscriptionEvent = {
    type: string
    descriptor: Device | null
    deviceModel: DeviceModel
}
export const useLedgerSubscription = ({ deviceId, onDevice }: Props) => {
    const deviceSubscription = useRef<TransportSubscription | undefined>(
        undefined,
    )

    const [availableDevices, setAvailableDevices] = useState<
        ConnectedLedgerDevice[]
    >([])

    const [canConnect, setCanConnect] = useState<boolean>(false)

    const startSubscription = useCallback(() => {
        if (deviceSubscription.current) return

        debug("useLedgerSubscription - startSubscription")

        deviceSubscription.current = BleTransport.listen({
            complete: () => {
                debug("complete")
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
                        productName: deviceModel.productName,
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
            error: error => {
                debug({ error })
            },
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        startSubscription()

        return () => {
            debug("useLedgerSubscription - endSubscription")

            if (deviceSubscription.current && PlatformUtils.isIOS()) {
                deviceSubscription.current.unsubscribe()
            }
        }
    }, [startSubscription])

    return {
        availableDevices,
        canConnect,
    }
}
