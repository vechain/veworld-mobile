import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { Device } from "react-native-ble-plx"
import { StatusCodes, VETLedgerAccount, VETLedgerApp } from "~Constants"
import { AddressUtils, CryptoUtils } from "~Utils"
import { hdnode1 } from "./wallets"
import { Characteristic } from "@ledgerhq/react-native-hw-transport-ble/lib/types"
import { DeviceModel, DeviceModelId } from "@ledgerhq/devices"
/*eslint-disable no-console*/
const publicKey =
    "042e7f024c8af943a41af6b74a8be59c57daf978282fb0118674cba85cac0fe68eeca595a4a84f93f76ab8d648e40e5ec880691787cbfe6607de578a4217d4c15c"
const chainCode =
    "9f2e11c29c3838b32cc4160acb8c163db2d85e8a795af8844210ad81edd3eaef"
const address = AddressUtils.getAddressFromXPub(
    CryptoUtils.xPubFromHdNode(hdnode1),
    0,
)
export const mockLedgerAccount = {
    publicKey,
    address,
    chainCode,
}

export const mockDeviceModel: DeviceModel = {
    id: DeviceModelId.nanoX,
    productName: "Ledger Nano X",
    usbOnly: false,
    productIdMM: 0x0004,
    legacyUsbProductId: 0x0001,
    memorySize: 0x100000,
    masks: [0x0000, 0x0000],
    getBlockSize: () => 0x1000,
}

export const mockedDevice = {
    isConnectable: null,
    localName: null,
    manufacturerData: null,
    mtu: 0,
    name: "Nano X B7F6",
    overflowServiceUUIDs: null,
    rssi: null,
    serviceData: null,
    serviceUUIDs: null,
    solicitedServiceUUIDs: null,
    txPowerLevel: null,
}

export const mockTransport = {
    deviceModel: mockDeviceModel,
    close(): Promise<void> {
        console.log("Closed transport")
        return Promise.resolve()
    },
    on(eventName: string) {
        console.log("Created event for: " + eventName)
    },
}

const characteristics: Characteristic = {
    uuid: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
    isWritableWithResponse: true,
    isWritableWithoutResponse: true,
    isNotifiable: false,
    isNotifying: false,
    value: null,
}

export const mockedTransport = new BleTransport(
    mockedDevice as Device,
    characteristics,
    characteristics,
    null as any,
    mockDeviceModel,
)

export const mockLedgerApp: VETLedgerApp = {
    // @ts-ignore
    transport: mockTransport,
    getAddress: async (
        _path: string,
        _display?: boolean | undefined,
        _chainCode?: boolean | undefined,
        _statusCodes?: StatusCodes[],
    ): Promise<VETLedgerAccount> => {
        return mockLedgerAccount
    },
    signJSON: (path: string, rawJSON: Buffer): Promise<Buffer> => {
        return Promise.resolve(Buffer.from(path + rawJSON.toString()))
    },
    signTransaction: (
        path: string,
        rawTransaction: Buffer,
    ): Promise<Buffer> => {
        return Promise.resolve(Buffer.from(path + rawTransaction.toString()))
    },
}
