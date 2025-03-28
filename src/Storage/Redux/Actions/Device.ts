import { AccountUtils, AddressUtils, debug, error } from "~Utils"
import { BaseDevice, DEVICE_TYPE, LedgerDevice, LocalDevice, NewLedgerDevice, WalletAccount } from "~Model"
import { selectDevices } from "../Selectors"
import { addDevice, bulkUpdateDevices, renameDevice, updateDevice } from "../Slices/Device"
import { AppThunk, createAppAsyncThunk } from "../Types"
import { addAccountForDevice } from "./Account"
import { addAccount } from "../Slices"
import { ERROR_EVENTS } from "~Constants"

/**
 *  Add a device and its first account
 * @param device  the device to add
 * @returns the added account
 */
const addDeviceAndAccounts =
    (device: LocalDevice): AppThunk<WalletAccount> =>
    dispatch => {
        dispatch(addDevice(device))

        let account: WalletAccount
        // If we are adding a private key device we want to add the root address as the first account
        if (device.type === DEVICE_TYPE.LOCAL_PRIVATE_KEY) {
            account = {
                alias: AccountUtils.rootAlias,
                address: device.rootAddress,
                rootAddress: device.rootAddress,
                index: -1,
                visible: true,
            }
            dispatch(addAccount(account))
        } else {
            account = dispatch(addAccountForDevice(device))
        }
        return account
    }

export const getNextDeviceIndex = (devices: BaseDevice[]) => {
    let index = 0
    const deviceIndexes = devices.map(acc => acc.index)
    while (deviceIndexes.includes(index)) {
        index++
    }
    return index
}

const addLedgerDeviceAndAccounts = createAppAsyncThunk(
    "device/addLedgerDeviceAndAccounts",
    async ({ deviceId, rootAccount, alias, accounts }: NewLedgerDevice, { dispatch, getState, rejectWithValue }) => {
        debug(ERROR_EVENTS.LEDGER, "Adding a ledger device")

        const devices = selectDevices(getState())

        try {
            if (!rootAccount.chainCode) throw new Error("Failed to extract chaincode from ledger device")
            const deviceExists = devices.find(device =>
                AddressUtils.compareAddresses(device.rootAddress, rootAccount.address),
            )

            if (deviceExists) return { device: deviceExists, accounts: [] }

            //Create the new ledger device and persist it
            const newDevice: LedgerDevice = {
                deviceId,
                xPub: {
                    publicKey: rootAccount.publicKey,
                    chainCode: rootAccount.chainCode,
                },
                index: getNextDeviceIndex(devices),
                rootAddress: rootAccount.address,
                type: DEVICE_TYPE.LEDGER,
                alias,
                position: 0, // this will be updated when the device is added to the redux store
            }

            dispatch(addDevice(newDevice))

            const newAccounts = accounts.map(accountIndex =>
                AccountUtils.getAccountForIndex(accountIndex, newDevice, accountIndex + 1),
            )

            dispatch(addAccount(newAccounts))

            return { device: newDevice, accounts: newAccounts }
        } catch (e) {
            error(ERROR_EVENTS.LEDGER, e)
            return rejectWithValue("Failed to add ledger device")
        }
    },
)

export { renameDevice, addDeviceAndAccounts, addLedgerDeviceAndAccounts, updateDevice, bulkUpdateDevices }
