import { useCallback, useEffect, useState } from "react"
import { NativeModules } from "react-native"
import { showErrorToast } from "~Components"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { PasswordUtils } from "~Utils"
const { CloudKitManager } = NativeModules

export const useCloudKit = () => {
    const { LL } = useI18nContext()
    const [isAvailable, setisAvailable] = useState(false)
    const [isWalletBackedUp, setIsWalletBackedUp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const getCloudKitAvailability = useCallback(async () => await CloudKitManager.checkCloudKitAvailability(), [])

    const saveWalletToCloudKit = useCallback(
        async ({
            mnemonic,
            _rootAddress,
            deviceType,
            firstAccountAddress,
            salt,
            iv,
        }: {
            mnemonic: string
            firstAccountAddress: string
            _rootAddress?: string
            deviceType?: DEVICE_TYPE
            salt: string
            iv: Uint8Array
        }) => {
            if (!mnemonic || !_rootAddress || !deviceType || !salt || !iv || !firstAccountAddress) {
                showErrorToast({
                    text1: LL.CLOUDKIT_ERROR_GENERIC(),
                })
                return
            }

            setIsLoading(true)
            const result = await CloudKitManager.saveToCloudKit(_rootAddress, mnemonic, deviceType, firstAccountAddress)

            if (result) {
                // save salt to seperate record in cloudkit
                const isSaltSaved = await CloudKitManager.saveSalt(_rootAddress, salt)
                // save iv to seperate record in cloudkit
                const isIvSaved = await CloudKitManager.saveIV(_rootAddress, PasswordUtils.bufferToBase64(iv))

                // TODO.vas - rollback in case of failure (delete last entry from cloudkit)
                if (!isSaltSaved || !isIvSaved) {
                    showErrorToast({
                        text1: LL.CLOUDKIT_ERROR_GENERIC(),
                    })
                    setIsLoading(false)
                    return
                }
            }

            setIsLoading(false)
        },
        [LL],
    )

    const getAllWalletsFromCloudKit = useCallback(async () => {
        setIsLoading(true)
        const result = await CloudKitManager.getAllFromCloudKit()
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

    const getSalt = useCallback(async (_rootAddress: string) => {
        return await CloudKitManager.getSalt(_rootAddress)
    }, [])

    const getIV = useCallback(async (_rootAddress: string) => {
        return await CloudKitManager.getIV(_rootAddress)
    }, [])

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
        getSalt,
        getIV,
    }
}
