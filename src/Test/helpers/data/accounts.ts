// Accounts
import { device1, device2, ledgerDevice } from "./devices"
import { hdnode1, hdnode2 } from "./wallets"
import { mockLedgerAccount } from "./ledger"
import { HDNode } from "thor-devkit"
import { Buffer } from "buffer"
import { WalletAccount } from "~Model"
import { AddressUtils, CryptoUtils } from "~Utils"

export const account1D1: WalletAccount = {
    alias: "D1 - Account 1",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(
        CryptoUtils.xPubFromHdNode(hdnode1),
        0,
    ),
    index: 0,
    visible: true,
}

export const account2D1: WalletAccount = {
    alias: "D1 - Account 2",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(
        CryptoUtils.xPubFromHdNode(hdnode1),
        1,
    ),
    index: 1,
    visible: true,
}

export const account3D1NotVisible: WalletAccount = {
    alias: "D1 - Account 3 - not visible",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(
        CryptoUtils.xPubFromHdNode(hdnode1),
        2,
    ),
    index: 2,
    visible: false,
}

export const account4D1: WalletAccount = {
    alias: "D1 - Account 4",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(
        CryptoUtils.xPubFromHdNode(hdnode1),
        3,
    ),
    index: 3,
    visible: true,
}

export const account1D2: WalletAccount = {
    alias: "D2 - Account 1",
    rootAddress: device2.rootAddress,
    address: AddressUtils.getAddressFromXPub(
        CryptoUtils.xPubFromHdNode(hdnode2),
        0,
    ),
    index: 0,
    visible: true,
}

export const account2D2NotVisible: WalletAccount = {
    alias: "D2 - Account 2 - not visible",
    rootAddress: device2.rootAddress,
    address: AddressUtils.getAddressFromXPub(
        CryptoUtils.xPubFromHdNode(hdnode2),
        1,
    ),
    index: 1,
    visible: false,
}

export const account3D2NotVisible: WalletAccount = {
    alias: "D2 - Account 3 - not visible",
    rootAddress: device2.rootAddress,
    address: AddressUtils.getAddressFromXPub(
        CryptoUtils.xPubFromHdNode(hdnode2),
        2,
    ),
    index: 2,
    visible: false,
}

//To create ledger accounts
const hdNode = HDNode.fromPublicKey(
    Buffer.from(mockLedgerAccount.publicKey, "hex"),
    Buffer.from(mockLedgerAccount.chainCode, "hex"),
)

//Don't add this to default storage/ cache - For testing
export const firstLedgerAccount: WalletAccount = {
    alias: "Ledger - A1",
    rootAddress: ledgerDevice.rootAddress,
    address: hdNode.derive(0).address,
    index: 0,
    visible: true,
}
