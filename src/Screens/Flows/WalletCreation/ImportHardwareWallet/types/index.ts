import { DeviceModel } from "@ledgerhq/devices"

export type LedgerDevice = {
    id: string
    isConnectable: boolean
    localName: string
    productName: string
    rssi: number
    deviceModel: DeviceModel
}
