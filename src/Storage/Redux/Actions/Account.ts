import { BaseDevice, WalletAccount } from "~Model"
import {
    setSelectedAccount,
    renameAccount,
    removeAccountsByDevice,
    setAccountVisibility,
    toggleAccountVisibility,
    addAccount,
} from "../Slices/Account"
import { AppThunk } from "../Types"
import { AddressUtils, AccountUtils } from "~Utils"
const addAccountForDevice =
    (device: BaseDevice): AppThunk<WalletAccount> =>
    (dispatch, getState) => {
        if (!device.xPub) throw new Error("This is not a valid HD wallet device")

        const { accounts } = getState()
        const deviceAccounts = accounts.accounts.filter(account =>
            AddressUtils.compareAddresses(account.rootAddress, device.rootAddress),
        )

        const nextIndex = AccountUtils.getNextIndex(deviceAccounts)

        const newAccountAddress = AddressUtils.getAddressFromXPub(device.xPub, nextIndex)

        const newAccount: WalletAccount = {
            alias: AccountUtils.nextAlias(nextIndex + 1, device.alias),
            address: newAccountAddress,
            rootAddress: device.rootAddress,
            index: nextIndex,
            visible: true,
        }
        dispatch(addAccount(newAccount))
        return newAccount
    }

export {
    setSelectedAccount,
    renameAccount,
    removeAccountsByDevice,
    setAccountVisibility,
    toggleAccountVisibility,
    addAccountForDevice,
}
