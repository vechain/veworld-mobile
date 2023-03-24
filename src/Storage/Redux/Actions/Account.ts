import { AddressUtils } from "~Common"
import { Device, WalletAccount } from "~Model"
import {
    selectAccount,
    renameAccount,
    removeAccountsByDevice,
    setAccountVisibility,
    toggleAccountVisibility,
    addAccount,
} from "../Slices/Account"
import { AppThunk } from "../Types"

const nextAlias = (accountId: number) => `Account ${accountId}`

const addAccountForDevice =
    (device: Device): AppThunk<WalletAccount> =>
    (dispatch, getState) => {
        if (!device.xPub)
            throw new Error("Cannot add account for device without xPub")
        const { accounts } = getState()
        const deviceAccounts = accounts.accounts.filter(account =>
            AddressUtils.compareAddresses(
                account.rootAddress,
                device.rootAddress,
            ),
        )

        const nextIndex =
            deviceAccounts.length > 0
                ? Math.max(...deviceAccounts.map(acc => acc.index)) + 1
                : 0

        const newAccountAddress = AddressUtils.getAddressFromXPub(
            device.xPub,
            nextIndex,
        )

        const newAccount: WalletAccount = {
            alias: nextAlias(nextIndex + 1),
            address: newAccountAddress,
            rootAddress: device.rootAddress,
            index: nextIndex,
            visible: true,
        }
        dispatch(addAccount(newAccount))
        return newAccount
    }

export {
    selectAccount,
    renameAccount,
    removeAccountsByDevice,
    setAccountVisibility,
    toggleAccountVisibility,
    addAccountForDevice,
}
