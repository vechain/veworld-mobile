// Devices
import { hdnode1, hdnode2 } from "./wallets"
import { mockLedgerAccount } from "./ledger"
import { DEVICE_TYPE, Device } from "~Model"
import { CryptoUtils } from "~Utils"

export const device1: Device = {
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
export const ledgerDevice: Device = {
    alias: "Ledger Device 1",
    rootAddress: mockLedgerAccount.address,
    type: DEVICE_TYPE.LEDGER,
    xPub: {
        publicKey: mockLedgerAccount.publicKey,
        chainCode: mockLedgerAccount.chainCode,
    },
    index: 0,
    wallet: "testEncryptedWallet",
}
