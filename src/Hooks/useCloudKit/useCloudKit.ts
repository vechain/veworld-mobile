import { useCallback, useEffect, useState } from "react"
import { NativeModules } from "react-native"
import { ERROR_EVENTS } from "~Constants"
import { DEVICE_TYPE } from "~Model"
import { info } from "~Utils"
const { CloudKitManager } = NativeModules

export const useCloudKit = () => {
    const [isAvailable, setisAvailable] = useState(false)
    const [isWalletBackedUp, setIsWalletBackedUp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const getCloudKitAvailability = useCallback(async () => await CloudKitManager.checkCloudKitAvailability(), [])

    const saveWalletToCloudKit = useCallback(
        async ({
            mnemonic,
            _rootAddress,
            deviceType,
            salt,
        }: {
            mnemonic: string
            _rootAddress?: string
            deviceType?: DEVICE_TYPE
            salt: string
        }) => {
            if (!mnemonic || !_rootAddress || !deviceType || !salt) throw new Error("No device to backup.")
            setIsLoading(true)
            const result = await CloudKitManager.saveToCloudKit(_rootAddress, mnemonic, deviceType, salt)
            info(ERROR_EVENTS.WALLET_CREATION, result)
            setIsLoading(false)
        },
        [],
    )

    const getAllWalletsFromCloudKit = useCallback(async () => {
        setIsLoading(true)
        const result = await CloudKitManager.getAllFromCloudKit()
        info(ERROR_EVENTS.WALLET_CREATION, result)
        setIsLoading(false)
        return result
    }, [])

    const getWalletByRootAddress = useCallback(
        async (_rootAddress: string) => {
            if (!isAvailable) return
            setIsLoading(true)
            const selectedWallet = await CloudKitManager.getWallet(_rootAddress)
            setIsWalletBackedUp(!!selectedWallet?.rootAddress)
            setIsLoading(false)
            return selectedWallet
        },
        [isAvailable],
    )

    useEffect(() => {
        getCloudKitAvailability().then(_isAvailable => setisAvailable(_isAvailable))
    }, [getCloudKitAvailability])

    return {
        getCloudKitAvailability,
        saveWalletToCloudKit,
        getAllWalletsFromCloudKit,
        isCloudKitAvailable: isAvailable,
        isWalletBackedUp,
        getWalletByRootAddress,
        isLoading,
    }
}
