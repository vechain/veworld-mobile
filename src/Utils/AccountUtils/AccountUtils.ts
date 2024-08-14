import { debug } from "~Utils/Logger"
import { BaseDevice, Contact, DEVICE_TYPE, WalletAccount, WatchedAccount } from "~Model"
import AddressUtils from "../AddressUtils"
import { ERROR_EVENTS } from "~Constants"
import { Vns } from "~Hooks"

export const rootAlias = "Root Account"

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

export const getAccountForIndex = (walletIndex: number, device: BaseDevice, accountId: number): WalletAccount => {
    debug(ERROR_EVENTS.UTILS, `Getting account for device, index ${walletIndex}`)
    if (!device.xPub) throw new Error("The XPub can't be null for HD devices")

    const accountAddress = AddressUtils.getAddressFromXPub(device.xPub, walletIndex)

    return {
        alias: nextAlias(accountId),
        address: accountAddress,
        rootAddress: device.rootAddress,
        index: walletIndex,
        visible: true,
    }
}

export function isObservedAccount(obj: any): obj is WatchedAccount {
    return obj && typeof obj === "object" && "type" in obj && obj.type === DEVICE_TYPE.LOCAL_WATCHED
}

export const updateAccoutVns = (account: Contact | WalletAccount, vnsData: Vns[]) => {
    const accountVns = vnsData.find(vns => AddressUtils.compareAddresses(vns.address, account.address))
    if (!accountVns) return account

    // Update the domain property if account is a contact
    if ("type" in account) {
        return {
            ...account,
            domain: accountVns.name,
        }
    }

    return {
        ...account,
        vnsName: accountVns.name,
    }
}
