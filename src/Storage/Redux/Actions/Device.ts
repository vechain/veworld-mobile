import {
    AccountUtils,
    AddressUtils,
    VETLedgerAccount,
    debug,
    error,
} from "~Common"
import { DEVICE_TYPE, LocalDevice, LedgerDevice, WalletAccount } from "~Model"
import { selectDevices, selectSelectedAccount } from "../Selectors"
import {
    addDevice,
    removeDeviceByIndex,
    renameDevice,
    updateDevice,
    bulkUpdateDevices,
} from "../Slices/Device"
import { AppThunk, createAppAsyncThunk } from "../Types"
import { addAccountForDevice, removeAccountsByDevice } from "./Account"
import { addAccount } from "../Slices"

import { DeviceModel } from "@ledgerhq/devices"

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
        const selectedAccount = selectSelectedAccount(getState())
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
    (device: LocalDevice): AppThunk<WalletAccount> =>
    dispatch => {
        dispatch(addDevice(device))
        //todo: here should add until i found an account with no balance
        const account = dispatch(addAccountForDevice(device))

        return account
    }

const addLedgerDevice = createAppAsyncThunk(
    "device/addLedgerDevice",
    async (
        {
            rootAccount,
            deviceModel,
            accounts,
        }: {
            rootAccount: VETLedgerAccount
            deviceModel: DeviceModel
            accounts: number[]
        },
        { dispatch, getState, rejectWithValue },
    ) => {
        debug("Adding a ledger device")

        const devices = selectDevices()(getState())

        try {
            if (!rootAccount.chainCode)
                throw new Error(
                    "Failed to extract chaincode from ledger device",
                )
            const deviceExists = devices.find(
                device => device.rootAddress === rootAccount.address,
            )

            //TODO: Do we want to handle this differently ?
            if (deviceExists) return deviceExists.rootAddress

            //Create the new ledger device and persist it
            const newDevice: LedgerDevice = {
                xPub: {
                    publicKey: rootAccount.publicKey,
                    chainCode: rootAccount.chainCode,
                },
                index: devices.length,
                rootAddress: rootAccount.address,
                type: DEVICE_TYPE.LEDGER,
                alias: deviceModel.productName,
            }

            dispatch(addDevice(newDevice))

            const newAccounts = accounts.map(accountIndex =>
                AccountUtils.getAccountForIndex(
                    accountIndex,
                    newDevice,
                    accountIndex,
                ),
            )

            dispatch(addAccount(newAccounts))

            return newDevice.rootAddress
        } catch (e) {
            error(e)
            return rejectWithValue("Failed to add ledger device")
        }
    },
)

export {
    renameDevice,
    removeDevice,
    addDeviceAndAccounts,
    addLedgerDevice,
    updateDevice,
    bulkUpdateDevices,
}
