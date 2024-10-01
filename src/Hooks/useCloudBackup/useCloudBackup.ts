import { useCallback, useEffect, useState } from "react"
import { useCloudKit } from "~Hooks/useCloudKit"
import { useGoogleDrive } from "~Hooks/useGoogleDrive"
import { PlatformUtils } from "~Utils"

export const useCloudBackup = () => {
    const [isAvailable, setisAvailable] = useState(false)

    const googleDrive = useGoogleDrive()
    const cloudKit = useCloudKit()

    useEffect(() => {
        if (PlatformUtils.isIOS()) {
            cloudKit
                .getCloudKitAvailability()
                .then(_isAvailable => setisAvailable(_isAvailable))
                .catch(() => setisAvailable(false))
        } else {
            googleDrive
                .getGoogleServicesAvailability()
                .then(_isAvailable => setisAvailable(_isAvailable))
                .catch(() => setisAvailable(false))
        }
    }, [cloudKit, googleDrive])

    const getWalletByRootAddress = useCallback(
        (_rootAddress: string) => {
            if (!isAvailable) {
                return
            }

            return PlatformUtils.isIOS()
                ? () => cloudKit.getWalletByRootAddress(_rootAddress)
                : () => googleDrive.getWalletByRootAddress(_rootAddress)
        },
        [cloudKit, googleDrive, isAvailable],
    )

    return {
        getCloudAvailability: PlatformUtils.isIOS()
            ? cloudKit.getCloudKitAvailability
            : googleDrive.getGoogleServicesAvailability,

        saveWalletToCloud: PlatformUtils.isIOS() ? cloudKit.saveWalletToCloudKit : googleDrive.saveWalletToGoogleDrive,

        getAllWalletFromCloud: PlatformUtils.isIOS()
            ? cloudKit.getAllWalletsFromCloudKit
            : googleDrive.getAllWalletsFromGoogleDrive,

        isCloudAvailable: isAvailable,
        isWalletBackedUp: PlatformUtils.isIOS() ? cloudKit.isWalletBackedUp : googleDrive.isWalletBackedUp,
        getWalletByRootAddress: getWalletByRootAddress,
        isLoading: PlatformUtils.isIOS() ? cloudKit.isLoading : googleDrive.isLoading,
        getSalt: PlatformUtils.isIOS() ? cloudKit.getSalt : googleDrive.getSalt,
        getIV: PlatformUtils.isIOS() ? cloudKit.getIV : googleDrive.getIV,
        deleteWallet: PlatformUtils.isIOS() ? cloudKit.deleteWallet : googleDrive.deleteWallet,
    }
}
