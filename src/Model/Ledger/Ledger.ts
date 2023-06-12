// import { DeviceModel } from "@ledgerhq/devices"
import { VETLedgerAccount } from "~Constants"

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
    name: string
    rssi: number
    productName: string
    // deviceModel: DeviceModel Additional info we don't need for now
}

/**
 * Represent a  new ledger device not inserted in the device slice yet (it's usually in the canche one in order to be added later)
 * - rootAccount: The root account of the device
 * - alias: The alias of the device
 * - accounts: The accounts of the device
 * @category Ledger
 */
export type NewLedgerDevice = {
    rootAccount: VETLedgerAccount
    alias: string
    accounts: number[]
}
