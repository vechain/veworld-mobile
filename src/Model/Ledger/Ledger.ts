import { DeviceModel } from "@ledgerhq/devices"

/**
 * Represent a ledger device that is connected to the device via bluetooth
 *  - id: The device id
 * - isConnectable: Whether the device is connectable
 * - localName: The local name of the device
 * - productName: The product name of the device
 * - rssi: The signal strength of the device
 * - deviceModel: The model of the device
 * @category Ledger
 */
export type ConnectedLedgerDevice = {
    id: string
    isConnectable: boolean
    localName: string
    productName: string
    rssi: number
    deviceModel: DeviceModel
}
