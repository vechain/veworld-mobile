import { AddressUtils, DeviceUtils } from "~Utils"
import { getNextDeviceIndex, useAppSelector } from "~Storage/Redux"
import { selectAccounts, selectDerivedPath, selectDevices, selectIsImportingWallet } from "~Storage/Redux/Selectors"
import { DEVICE_CREATION_ERRORS as ERRORS, LocalDevice, Wallet } from "~Model"
import { getAddressFromXPub } from "~Utils/AddressUtils/AddressUtils"
import * as i18n from "~i18n"

type WalletAndDevice = {
    wallet: Wallet
    device: Omit<LocalDevice, "wallet">
}

export const useDeviceUtils = () => {
    const devices = useAppSelector(selectDevices)
    const accounts = useAppSelector(selectAccounts)
    const path = useAppSelector(selectDerivedPath)
    const isImportingWallet = useAppSelector(selectIsImportingWallet)
    /**
     * Verify that a conflicting device doesn't already exist
     * Throws an error if a device already exists with the same root address or if an account already exists with the same address
     * @param device
     */
    const verifyDeviceDoesntExist = (device: Omit<LocalDevice, "wallet">) => {
        // Check if a device with the same root address already exists
        const deviceAlreadyExist = devices.find(d => AddressUtils.compareAddresses(d.rootAddress, device.rootAddress))
        if (deviceAlreadyExist) throw new Error(ERRORS.ADDRESS_EXISTS)

        // Check if an account with the same address as the device root address already exists
        const accountAlreadyExist = accounts.find(a => AddressUtils.compareAddresses(a.address, device.rootAddress))
        if (accountAlreadyExist) throw new Error(ERRORS.ADDRESS_EXISTS)

        // Check if a device exists with the same root address as the first child account
        if (device.xPub) {
            const firstChildAddress = getAddressFromXPub(device.xPub, 0)
            if (devices.find(d => AddressUtils.compareAddresses(d.rootAddress, firstChildAddress)))
                throw new Error(ERRORS.ADDRESS_EXISTS)
        }
    }

    /**
     * Generate a device from a given mnemonic phrase or private key, throwing an error if the device already exists
     * @param mnemonic (optional)
     * @param privateKey (optional)
     */
    const createDevice = (mnemonic?: string[], privateKey?: string) => {
        if (!mnemonic && !privateKey) throw new Error(ERRORS.INVALID_IMPORT_DATA)

        const deviceIndex = getNextDeviceIndex(devices)

        const locale = i18n.detectLocale()
        const alias = `${i18n.i18n()[locale].WALLET_LABEL_WALLET()} ${deviceIndex + 1}`

        let walletAndDevice: WalletAndDevice
        if (mnemonic) {
            walletAndDevice = DeviceUtils.generateDeviceForMnemonic(
                mnemonic,
                deviceIndex,
                alias,
                path,
                isImportingWallet,
            )
        } else if (privateKey) {
            walletAndDevice = DeviceUtils.generateDeviceForPrivateKey(privateKey, deviceIndex, alias)
        } else throw new Error(ERRORS.UNKNOWN_ERROR)

        verifyDeviceDoesntExist(walletAndDevice.device)

        return walletAndDevice
    }

    const checkCanImportDevice = (mnemonic?: string[], privateKey?: string): void => {
        createDevice(mnemonic, privateKey)
    }

    return {
        createDevice,
        checkCanImportDevice,
        verifyDeviceDoesntExist,
    }
}
