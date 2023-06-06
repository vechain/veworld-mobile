import { AddressUtils } from "~Utils"
import { useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import { getNodes } from "../useCreateWallet/Helpers"

export const useDeviceUtils = () => {
    const devices = useAppSelector(selectDevices)
    /**
     * Generate a device from a given mnemonic, throwing an error if the device already exists
     * @param mnemonic
     */
    const getDeviceFromMnemonic = (mnemonic: string) => {
        const deviceIndex = devices.length
        const aliasIndex = deviceIndex + 1
        const { device, wallet } = getNodes(
            mnemonic.split(" "),
            deviceIndex,
            aliasIndex,
        )

        const deviceAlreadyExist = devices.find(d =>
            AddressUtils.compareAddresses(d.rootAddress, device.rootAddress),
        )

        if (deviceAlreadyExist) throw new Error("Device already exists")

        return { device, wallet }
    }

    return { getDeviceFromMnemonic }
}
