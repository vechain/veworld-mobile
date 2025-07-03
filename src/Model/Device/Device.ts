import { DerivationPath } from "~Constants"
import { XPub } from "../Crypto"
import { DEVICE_TYPE, Wallet } from "../Wallet"

/** A general model for storing data about devices in the wallet
 * @field `xPub` - used to generate new address without accessing the device directly
 * @field `rootAddress` - The address of the first account in this wallet
 * @field `type` - The type of wallet - Ledger, Local, etc
 * @field `alias` - a name for this device

 * @field `index` - the index of this device in the wallet
 */
export interface BaseDevice {
    xPub?: XPub
    rootAddress: string
    type: DEVICE_TYPE
    alias: string
    index: number
    position: number
    derivationPath?: DerivationPath
    isBuckedUp?: boolean
    isBackedUpManual?: boolean
    lastBackupDate?: string
    isMigrated?: boolean
}

/**
 * A local device with an encrypted wallet
 * @field `wallet` - the (encrypted) wallet this device belongs to
 */
export interface LocalDevice extends BaseDevice {
    wallet: string
    readonly type: DEVICE_TYPE.LOCAL_MNEMONIC | DEVICE_TYPE.LOCAL_PRIVATE_KEY | DEVICE_TYPE.LOCAL_WATCHED
}

/**
 * The ledger device
 */
export interface LedgerDevice extends BaseDevice {
    deviceId: string
    readonly type: DEVICE_TYPE.LEDGER
}

export interface SmartWalletDevice extends BaseDevice {
    readonly type: DEVICE_TYPE.SMART_WALLET
}

export type WalletAndDevice = {
    wallet: Wallet
    device: Omit<LocalDevice, "wallet">
}
