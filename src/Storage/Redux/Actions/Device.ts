import { AddressUtils } from "~Common"
import { Device, WalletAccount } from "~Model"
import { getSelectedAccount } from "../Selectors"
import {
    addDevice,
    removeDeviceByIndex,
    renameDevice,
    updateDevice,
    bulkUpdateDevices,
} from "../Slices/Device"
import { AppThunk } from "../Types"
import { addAccountForDevice, removeAccountsByDevice } from "./Account"

/**
 * Remove the specified device and its accounts
 * @param rootAddress rootAddress of device to remove
 * @throws Error if the device to remove is the selected account's device
 * @returns
 */
const removeDevice =
    (rootAddress: string): AppThunk =>
    (dispatch, getState) => {
        const { devices } = getState()
        const selectedAccount = getSelectedAccount(getState())
        const isSelectedAccountInDevice = AddressUtils.compareAddresses(
            rootAddress,
            selectedAccount?.rootAddress,
        )
        if (isSelectedAccountInDevice)
            throw new Error("Cannot delete the selected account's device!")

        dispatch(removeAccountsByDevice({ rootAddress }))
        const deviceIndex = devices.findIndex(
            device => device.rootAddress === rootAddress,
        )
        if (deviceIndex !== -1) {
            dispatch(removeDeviceByIndex({ index: deviceIndex }))
        }
    }

/**
 *  Add a device and its first account
 * @param device  the device to add
 * @returns the added account
 */
const addDeviceAndAccounts =
    (device: Device): AppThunk<WalletAccount> =>
    dispatch => {
        dispatch(addDevice(device))
        //todo: here should add until i found an account with no balance
        const account = dispatch(addAccountForDevice(device))

        return account
    }

export {
    renameDevice,
    removeDevice,
    addDeviceAndAccounts,
    updateDevice,
    bulkUpdateDevices,
}
