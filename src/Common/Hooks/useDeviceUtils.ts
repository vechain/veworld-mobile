import { AddressUtils } from "~Common/Utils"
import { getDevices, useRealm } from "~Storage"
import { getDeviceAndAliasIndex, getNodes } from "./useCreateWallet/Helpers"

export const useDeviceUtils = () => {
    const { store } = useRealm()

    /**
     * Generate a device from a given mnemonic, throwing an error if the device already exists
     * @param mnemonic
     */
    const getDeviceFromMnemonic = (mnemonic: string) => {
        const devices = getDevices(store)
        const { deviceIndex, aliasIndex } = getDeviceAndAliasIndex(devices)
        const { device, wallet } = getNodes(
            mnemonic.split(" "),
            deviceIndex,
            aliasIndex,
        )

        const deviceAlreadyExist = devices.find(d =>
            AddressUtils.compareAddresses(d.rootAddress, device.rootAddress),
        )

        if (deviceAlreadyExist) throw new Error("Device already exists")

        return { device, wallet, deviceIndex, aliasIndex }
    }

    return { getDeviceFromMnemonic }
}
