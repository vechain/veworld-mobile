import { useCallback } from "react"
import { NativeModules } from "react-native"
import { showErrorToast, showInfoToast } from "~Components"
import { AnalyticsEvent, DerivationPath, ERROR_EVENTS } from "~Constants"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { error, PasswordUtils } from "~Utils"
import { GDError, handleGoogleDriveErrors } from "./ErrorModel"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
const { GoogleDriveManager } = NativeModules

export const useGoogleDrive = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()

    const getGoogleServicesAvailability = useCallback(async () => {
        try {
            return await GoogleDriveManager.checkGoogleServicesAvailability()
        } catch (err) {
            const er = err as GDError
            error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
            const errorInfo = handleGoogleDriveErrors(er)

            if (errorInfo) {
                showErrorToast({
                    text1: errorInfo.title,
                    text2: errorInfo.description,
                })
            }
        }
    }, [])

    const deleteWallet = useCallback(
        async (_rootAddress: string) => {
            try {
                track(AnalyticsEvent.DELETE_BACKUP)
                await GoogleDriveManager.deleteWallet(_rootAddress)
                track(AnalyticsEvent.DELETE_BACKUP_SUCCESS)
                return true
            } catch (err) {
                const er = err as GDError
                error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
                const errorInfo = handleGoogleDriveErrors(er)

                if (errorInfo) {
                    showErrorToast({
                        text1: errorInfo.title,
                        text2: errorInfo.description,
                    })
                }
                return false
            }
        },
        [track],
    )

    const saveWalletToGoogleDrive = useCallback(
        async ({
            mnemonic,
            _rootAddress,
            deviceType,
            firstAccountAddress,
            salt,
            iv,
            derivationPath,
        }: {
            mnemonic: string
            firstAccountAddress: string
            _rootAddress?: string
            deviceType?: DEVICE_TYPE
            salt: string
            iv: Uint8Array
            derivationPath: DerivationPath
        }) => {
            track(AnalyticsEvent.SAVE_BACKUP_TO_CLOUD_START)
            if (!mnemonic || !_rootAddress || !deviceType || !salt || !iv || !firstAccountAddress) {
                showErrorToast({
                    text1: LL.GOOGLE_DRIVE_ERROR_GENERIC(),
                })
                return false
            }

            try {
                await GoogleDriveManager.saveToGoogleDrive(
                    _rootAddress,
                    mnemonic,
                    deviceType,
                    firstAccountAddress,
                    salt,
                    PasswordUtils.bufferToBase64(iv),
                    derivationPath,
                )
                track(AnalyticsEvent.SAVE_BACKUP_TO_CLOUD_SUCCESS)
                return true
            } catch (err) {
                const er = err as GDError
                error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
                const errorInfo = handleGoogleDriveErrors(er)

                if (errorInfo) {
                    showErrorToast({
                        text1: errorInfo.title,
                        text2: errorInfo.description,
                    })
                }
                return false
            }
        },
        [LL, track],
    )

    const getAllWalletsFromGoogleDrive = useCallback(async () => {
        try {
            track(AnalyticsEvent.IMPORT_ALL_BACKUPS_FROM_WALLET_START)
            const result = await GoogleDriveManager.getAllWalletsFromGoogleDrive()
            if (Array.isArray(result) && result.length === 0) {
                showInfoToast({
                    text1: LL.CLOUD_NO_WALLETS_AVAILABLE_TITLE(),
                    text2: LL.CLOUD_NO_WALLETS_AVAILABLE_DESCRIPTION({
                        cloud: "Google Drive",
                    }),
                })
            }
            track(AnalyticsEvent.IMPORT_ALL_BACKUPS_FROM_WALLET_SUCCESS)
            return result
        } catch (err) {
            const er = err as GDError
            error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
            const errorInfo = handleGoogleDriveErrors(er)

            if (errorInfo) {
                showErrorToast({
                    text1: errorInfo.title,
                    text2: errorInfo.description,
                })
            }
            return []
        }
    }, [LL, track])

    const getWalletByRootAddress = useCallback(
        async (_rootAddress?: string) => {
            track(AnalyticsEvent.IMPORT_FROM_CLOUD_START)
            if (!_rootAddress) {
                throw new Error("Root address is required")
            }

            try {
                const selectedWallet = await GoogleDriveManager.getWallet(_rootAddress)
                track(AnalyticsEvent.IMPORT_FROM_CLOUD_SUCCESS)
                return selectedWallet
            } catch (err) {
                const er = err as GDError
                error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
                const errorInfo = handleGoogleDriveErrors(er)

                if (errorInfo) {
                    showErrorToast({
                        text1: errorInfo.title,
                        text2: errorInfo.description,
                    })
                }

                throw er
            }
        },
        [track],
    )

    const getSalt = useCallback(async (_rootAddress: string) => {
        try {
            const salt = await GoogleDriveManager.getSalt(_rootAddress)
            return salt
        } catch (err) {
            const er = err as GDError
            error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
            const errorInfo = handleGoogleDriveErrors(er)

            if (errorInfo) {
                showErrorToast({
                    text1: errorInfo.title,
                    text2: errorInfo.description,
                })
            }
        }
    }, [])

    const getIV = useCallback(async (_rootAddress: string) => {
        try {
            const salt = await GoogleDriveManager.getIV(_rootAddress)
            return salt
        } catch (err) {
            const er = err as GDError
            error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
            const errorInfo = handleGoogleDriveErrors(er)

            if (errorInfo) {
                showErrorToast({
                    text1: errorInfo.title,
                    text2: errorInfo.description,
                })
            }
        }
    }, [])

    const googleAccountSignOut = useCallback(async () => {
        try {
            const salt = await GoogleDriveManager.googleAccountSignOut()
            return salt
        } catch (err) {
            const er = err as GDError
            error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
            const errorInfo = handleGoogleDriveErrors(er)

            if (errorInfo) {
                showErrorToast({
                    text1: errorInfo.title,
                    text2: errorInfo.description,
                })
            }
        }
    }, [])

    return {
        getGoogleServicesAvailability,
        deleteWallet,
        saveWalletToGoogleDrive,
        getAllWalletsFromGoogleDrive,
        getWalletByRootAddress,
        getSalt,
        getIV,
        googleAccountSignOut,
    }
}
