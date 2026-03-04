import { BaseDevice, WalletAccount } from "~Model"
import { AppThunk } from "../Types"
import { AddressUtils, AccountUtils } from "~Utils"
import { addAccount } from "../Slices/Account"

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

        const isDefaultName = /^Wallet \d+$/.test(device.alias)
        const alias = isDefaultName
            ? AccountUtils.nextAlias(nextIndex + 1, "Account")
            : AccountUtils.nextAlias(nextIndex + 1, device.alias)
        const newAccount: WalletAccount = {
            alias,
            address: newAccountAddress,
            rootAddress: device.rootAddress,
            index: nextIndex,
            visible: true,
        }
        dispatch(addAccount(newAccount))
        return newAccount
    }

export { addAccountForDevice }
