import { useCallback, useEffect, useMemo, useState } from "react"
import { NativeModules } from "react-native"
import { ERROR_EVENTS } from "~Constants"
import { LocalDevice } from "~Model"
import { info } from "~Utils"
const { CloudKitManager } = NativeModules

export const useCloudKit = (deviceToBackup?: LocalDevice) => {
    const [isAvailable, setisAvailable] = useState(false)

    const getCloudKitAvailability = useCallback(async () => await CloudKitManager.checkCloudKitAvailability(), [])

    useEffect(() => {
        getCloudKitAvailability().then(_isAvailable => setisAvailable(_isAvailable))
    }, [getCloudKitAvailability])

    const saveWalletToCloudKit = useCallback(async () => {
        if (!deviceToBackup) throw new Error("No device to backup.")

        let rootAddress = deviceToBackup.rootAddress
        let data = deviceToBackup.wallet

        const result = await CloudKitManager.saveToCloudKit(rootAddress, data, deviceToBackup.type)
        info(ERROR_EVENTS.WALLET_CREATION, result)
    }, [deviceToBackup])

    const getAllWalletsFromCloudKit = useCallback(async () => {
        const result = await CloudKitManager.getAllFromCloudKit()
        info(ERROR_EVENTS.WALLET_CREATION, result)
        return result
    }, [])

    const getWalletByRootAddress = useCallback(async (rootAddress: string) => {
        const selectedWallet = await CloudKitManager.getWallet(rootAddress)
        info(ERROR_EVENTS.WALLET_CREATION, selectedWallet)
        return selectedWallet
    }, [])

    const isWalletBackedUp = useMemo(async () => {
        // TODO - get wallet by rootAddress from CloudKit
        return false
    }, [])

    return {
        getCloudKitAvailability,
        saveWalletToCloudKit,
        getAllWalletsFromCloudKit,
        isCloudKitAvailable: isAvailable,
        isWalletBackedUp,
        getWalletByRootAddress,
    }
}
