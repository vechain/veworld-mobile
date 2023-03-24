import { AddressUtils } from "~Common"
import { getSelectedAccount } from "../Selectors"
import { removeDeviceByIndex, renameDevice } from "../Slices/Device"
import { AppThunk } from "../Types"
import { removeAccountsByDevice } from "./Account"

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

export { renameDevice, removeDevice }
