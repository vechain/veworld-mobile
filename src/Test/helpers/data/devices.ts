// Devices
import { hdnode1, hdnode2 } from "./wallets"
import { mockLedgerAccount } from "./ledger"
import { DEVICE_TYPE, LocalDevice, LedgerDevice } from "~Model"
import { CryptoUtils } from "~Utils"

export const device1: LocalDevice = {
    alias: "Device 1",
    rootAddress: hdnode1.address,
    type: DEVICE_TYPE.LOCAL_MNEMONIC,
    xPub: CryptoUtils.xPubFromHdNode(hdnode1),
    index: 0,
    wallet: "testEncryptedWallet",
}

export const device2 = {
    alias: "Device 2",
    rootAddress: hdnode2.address,
    type: DEVICE_TYPE.LOCAL_MNEMONIC,
    xPub: CryptoUtils.xPubFromHdNode(hdnode2),
}

//Don't add this to default storage/ cache - For testing
export const ledgerDevice: LedgerDevice = {
    alias: "Ledger Device 1",
    deviceId: "testDeviceId",
    rootAddress: mockLedgerAccount.address,
    type: DEVICE_TYPE.LEDGER,
    xPub: {
        publicKey: mockLedgerAccount.publicKey,
        chainCode: mockLedgerAccount.chainCode,
    },
    index: 0,
}
