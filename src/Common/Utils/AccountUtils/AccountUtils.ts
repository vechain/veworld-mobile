import { debug } from "~Common/Logger"
import { BaseDevice, WalletAccount } from "~Model"
import { getAddressFromXPub } from "../AddressUtils/AddressUtils"

export const nextAlias = (accountId: number) => `Account ${accountId}`

/**
 *  Find the next index for a new account based on the current accounts
 * @param accounts
 * @returns
 */
export const getNextIndex = (accounts: WalletAccount[]) => {
    let index = 0
    const accountsIndex = accounts.map(acc => acc.index)
    while (accountsIndex.includes(index)) {
        index++
    }
    return index
}

export const getAccountForIndex = (
    walletIndex: number,
    device: BaseDevice,
    accountId: number,
): WalletAccount => {
    debug(`Getting account for device, index ${walletIndex}`)
    if (!device.xPub) throw new Error("The XPub can't be null for HD devices")

    const accountAddress = getAddressFromXPub(device.xPub, walletIndex)

    return {
        alias: nextAlias(accountId),
        address: accountAddress,
        rootAddress: device.rootAddress,
        index: walletIndex,
        visible: true,
    }
}
