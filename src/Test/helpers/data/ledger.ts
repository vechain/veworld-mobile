import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { Device } from "react-native-ble-plx"
import VETLedgerApp, {
    StatusCodes,
    VETLedgerAccount,
} from "~Common/Ledger/VetLedgerApp"

/*eslint-disable no-console*/
export const mockLedgerAccount = {
    publicKey:
        "042e7f024c8af943a41af6b74a8be59c57daf978282fb0118674cba85cac0fe68eeca595a4a84f93f76ab8d648e40e5ec880691787cbfe6607de578a4217d4c15c",
    address: "0x2749808b9d2d2ec0aef731a357cac6f2f468a58d",
    chainCode:
        "9f2e11c29c3838b32cc4160acb8c163db2d85e8a795af8844210ad81edd3eaef",
}

export const mockDeviceModel = {
    id: "nanoX",
    productName: "Ledger Nano X",
    usbOnly: false,
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

// @ts-ignore
export const mockedTransport: BleTransport = {
    // @ts-ignore
    deviceModel: mockDeviceModel, // @ts-ignore
    device: mockedDevice,
    close(): Promise<void> {
        console.log("Closed transport")
        return Promise.resolve()
    },
    open(_deviceOrId: string | Device): Promise<BleTransport> {
        return Promise.resolve(mockedTransport)
    },

    on(eventName: string) {
        console.log("Created event for: " + eventName)
    },
    exchange(): Promise<any> {
        return Promise.resolve()
    },
    exchangeAtomicImpl(): Promise<any> {
        return Promise.resolve()
    },
    exchangeBusyPromise: null,
    exchangeTimeout: 30000,
    id: "4418A927-A5E6-5743-8F64-895250CC29F9",
    isConnected: true,
    mtuSize: 153,
    notYetDisconnected: true,
}

export const mockLedgerApp: VETLedgerApp = {
    // @ts-ignore
    transport: mockTransport,
    getAccount: async (
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
