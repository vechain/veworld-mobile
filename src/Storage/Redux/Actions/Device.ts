import { VETLedgerAccount, debug, error } from "~Common"
import { AddressUtils, AccountUtils } from "~Utils"
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
            selectedAccount.rootAddress,
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

const addLedgerDeviceAndAccounts = createAppAsyncThunk(
    "device/addLedgerDeviceAndAccounts",
    async (
        {
            rootAccount,
            alias,
            accounts,
        }: {
            rootAccount: VETLedgerAccount
            alias: string
            accounts: number[]
        },
        { dispatch, getState, rejectWithValue },
    ) => {
        debug("Adding a ledger device")

        const devices = selectDevices(getState())

        try {
            if (!rootAccount.chainCode)
                throw new Error(
                    "Failed to extract chaincode from ledger device",
                )
            const deviceExists = devices.find(device =>
                AddressUtils.compareAddresses(
                    device.rootAddress,
                    rootAccount.address,
                ),
            )

            //TODO: Do we want to handle this differently ?
            if (deviceExists) return { device: deviceExists, accounts: [] }

            //Create the new ledger device and persist it
            const newDevice: LedgerDevice = {
                xPub: {
                    publicKey: rootAccount.publicKey,
                    chainCode: rootAccount.chainCode,
                },
                index: devices.length,
                rootAddress: rootAccount.address,
                type: DEVICE_TYPE.LEDGER,
                alias,
            }

            dispatch(addDevice(newDevice))

            const newAccounts = accounts.map(accountIndex =>
                AccountUtils.getAccountForIndex(
                    accountIndex,
                    newDevice,
                    accountIndex + 1,
                ),
            )

            dispatch(addAccount(newAccounts))

            return { device: newDevice, accounts: newAccounts }
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
    addLedgerDeviceAndAccounts,
    updateDevice,
    bulkUpdateDevices,
}
