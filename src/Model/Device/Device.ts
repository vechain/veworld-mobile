import { XPub } from "../Crypto"
import { DEVICE_TYPE } from "../Wallet"

/** A model for storing data about any connected devices such as hardware wallets
 * @field `xPub` - used to generate new address without accessing the device directly
 * @field `rootAddress` - The address of the first account in this wallet
 * @field `type` - The type of wallet - Ledger, Local, etc
 * @field `alias` - a name for this device
 * @field `wallet` - the (encrypted) wallet this device belongs to
 */
export interface Device {
    xPub?: XPub
    rootAddress: string
    type: DEVICE_TYPE
    alias: string
    wallet: string
    index: number
}
