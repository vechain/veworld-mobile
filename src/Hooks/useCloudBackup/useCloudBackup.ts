import { useCallback, useEffect, useState } from "react"
import { useCloudKit } from "~Hooks/useCloudKit"
import { useGoogleDrive } from "~Hooks/useGoogleDrive"
import { PlatformUtils } from "~Utils"

export const useCloudBackup = () => {
    const [isAvailable, setisAvailable] = useState(false)

    const {
        getWalletByRootAddress: getWalletFromDrive,
        saveWalletToGoogleDrive,
        getAllWalletsFromGoogleDrive,
        getSalt: getSaltFromDrive,
        getIV: getIVFromDrive,
        deleteWallet: deleteWalletFromDrive,
        getGoogleServicesAvailability,
        googleAccountSignOut,
    } = useGoogleDrive()

    const {
        getWalletByRootAddress: getWalletFromICloud,
        saveWalletToCloudKit,
        getAllWalletsFromCloudKit,
        getSalt: getSaltFromICloud,
        getIV: getIVFromICloud,
        deleteWallet: deleteWalletFromICloud,
        getCloudKitAvailability,
    } = useCloudKit()

    useEffect(() => {
        if (PlatformUtils.isIOS()) {
            getCloudKitAvailability()
                .then(_isAvailable => setisAvailable(_isAvailable))
                .catch(() => setisAvailable(false))
        } else {
            getGoogleServicesAvailability()
                .then(_isAvailable => setisAvailable(_isAvailable))
                .catch(() => setisAvailable(false))
        }
    }, [getCloudKitAvailability, getGoogleServicesAvailability])

    const getWalletByRootAddress = useCallback(
        async (_rootAddress?: string) => {
            return PlatformUtils.isIOS()
                ? await getWalletFromICloud(_rootAddress)
                : await getWalletFromDrive(_rootAddress)
        },
        [getWalletFromDrive, getWalletFromICloud],
    )

    return {
        saveWalletToCloud: PlatformUtils.isIOS() ? saveWalletToCloudKit : saveWalletToGoogleDrive,
        getAllWalletFromCloud: PlatformUtils.isIOS() ? getAllWalletsFromCloudKit : getAllWalletsFromGoogleDrive,
        isCloudAvailable: isAvailable,
        getWalletByRootAddress: getWalletByRootAddress,
        getSalt: PlatformUtils.isIOS() ? getSaltFromICloud : getSaltFromDrive,
        getIV: PlatformUtils.isIOS() ? getIVFromICloud : getIVFromDrive,
        deleteWallet: PlatformUtils.isIOS() ? deleteWalletFromICloud : deleteWalletFromDrive,
        googleAccountSignOut: PlatformUtils.isIOS() ? () => {} : googleAccountSignOut,
    }
}
