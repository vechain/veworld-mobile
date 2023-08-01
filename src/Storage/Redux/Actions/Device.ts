import { AccountUtils, AddressUtils, debug, error } from "~Utils"
import {
    BaseDevice,
    DEVICE_TYPE,
    LedgerDevice,
    LocalDevice,
    NewLedgerDevice,
    WalletAccount,
} from "~Model"
import { selectDevices } from "../Selectors"
import {
    addDevice,
    bulkUpdateDevices,
    renameDevice,
    updateDevice,
} from "../Slices/Device"
import { AppThunk, createAppAsyncThunk } from "../Types"
import { addAccountForDevice } from "./Account"
import { addAccount } from "../Slices"

/**
 *  Add a device and its first account
 * @param device  the device to add
 * @returns the added account
 */
const addDeviceAndAccounts =
    (device: LocalDevice): AppThunk<WalletAccount> =>
    dispatch => {
        dispatch(addDevice(device))
        // TODO (Erik) (https://github.com/vechainfoundation/veworld-mobile/issues/773) here should add until i found an account with no balance
        const account = dispatch(addAccountForDevice(device))

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
    async (
        { deviceId, rootAccount, alias, accounts }: NewLedgerDevice,
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
            error("addLedgerDeviceAndAccounts", e)
            return rejectWithValue("Failed to add ledger device")
        }
    },
)

export {
    renameDevice,
    addDeviceAndAccounts,
    addLedgerDeviceAndAccounts,
    updateDevice,
    bulkUpdateDevices,
}
