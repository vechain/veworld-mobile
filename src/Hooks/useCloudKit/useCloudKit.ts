import { useCallback } from "react"
import { NativeModules } from "react-native"
import { showErrorToast, showInfoToast } from "~Components"
import { AnalyticsEvent, DerivationPath, ERROR_EVENTS } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { error, PasswordUtils } from "~Utils"
import { CKError, handleCloudKitErrors } from "./ErrorModel"

const { CloudKitManager } = NativeModules

export const useCloudKit = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()

    const getCloudKitAvailability = useCallback(async () => {
        try {
            return await CloudKitManager.checkCloudKitAvailability()
        } catch (_error) {
            let er = _error as CKError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            showErrorToast({
                text1: er.message,
                text2: handleCloudKitErrors(er),
            })
        }
    }, [])

    const deleteWallet = useCallback(
        async (_rootAddress: string) => {
            try {
                track(AnalyticsEvent.DELETE_BACKUP)
                const delWAllet = await CloudKitManager.deleteWallet(_rootAddress)
                const delSalt = await CloudKitManager.deleteSalt(_rootAddress)
                const delIV = await CloudKitManager.deleteIV(_rootAddress)
                delWAllet && delSalt && delIV && track(AnalyticsEvent.DELETE_BACKUP_SUCCESS)
                return delWAllet && delSalt && delIV
            } catch (_error) {
                let er = _error as CKError
                error(ERROR_EVENTS.CLOUDKIT, er, er.message)
                showErrorToast({
                    text1: er.message,
                    text2: handleCloudKitErrors(er),
                })
            }
        },
        [track],
    )

    const saveWalletToCloudKit = useCallback(
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
                    text1: LL.CLOUDKIT_ERROR_GENERIC(),
                })
                error(ERROR_EVENTS.CLOUDKIT, "Validation failed: Missing required fields.")
                return false
            }

            try {
                const result = await CloudKitManager.saveToCloudKit(
                    _rootAddress,
                    mnemonic,
                    deviceType,
                    firstAccountAddress,
                    derivationPath,
                )

                if (result) {
                    const isSaltSaved = await CloudKitManager.saveSalt(_rootAddress, salt)
                    const isIvSaved = await CloudKitManager.saveIV(_rootAddress, PasswordUtils.bufferToBase64(iv))

                    if (!isSaltSaved || !isIvSaved) {
                        await deleteWallet(_rootAddress)
                        showErrorToast({
                            text1: LL.CLOUDKIT_ERROR_GENERIC(),
                        })
                        error(ERROR_EVENTS.CLOUDKIT, "Failed to save salt or iv to CloudKit.")
                        return false
                    }

                    track(AnalyticsEvent.SAVE_BACKUP_TO_CLOUD_SUCCESS)
                    return true
                }
                error(ERROR_EVENTS.CLOUDKIT, "CloudKit save operation returned an invalid result.")
                return false
            } catch (_error: unknown) {
                await deleteWallet(_rootAddress)
                let er = _error as CKError
                error(ERROR_EVENTS.CLOUDKIT, er, er.message)
                showErrorToast({
                    text1: er.message,
                    text2: handleCloudKitErrors(er),
                })
                return false
            }
        },
        [LL, deleteWallet, track],
    )

    const getAllWalletsFromCloudKit = useCallback(async () => {
        track(AnalyticsEvent.IMPORT_ALL_BACKUPS_FROM_WALLET_START)
        try {
            const result = await CloudKitManager.getAllFromCloudKit()
            if (Array.isArray(result) && result.length === 0) {
                showInfoToast({
                    text1: LL.CLOUD_NO_WALLETS_AVAILABLE_TITLE(),
                    text2: LL.CLOUD_NO_WALLETS_AVAILABLE_DESCRIPTION({
                        cloud: "ICloud",
                    }),
                })
            }
            track(AnalyticsEvent.IMPORT_ALL_BACKUPS_FROM_WALLET_SUCCESS)
            return result
        } catch (_error) {
            let er = _error as CKError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            showErrorToast({
                text1: er.message,
                text2: handleCloudKitErrors(er),
            })
            return []
        }
    }, [LL, track])

    const getWalletByRootAddress = useCallback(
        async (_rootAddress?: string) => {
            track(AnalyticsEvent.IMPORT_FROM_CLOUD_START)

            if (!_rootAddress) {
                error(ERROR_EVENTS.CLOUDKIT, "Root address is required.")
                throw new Error("Root address is required")
            }

            try {
                const selectedWallet = await CloudKitManager.getWallet(_rootAddress)
                track(AnalyticsEvent.IMPORT_FROM_CLOUD_SUCCESS)
                return selectedWallet
            } catch (_error) {
                let er = _error as CKError
                error(ERROR_EVENTS.CLOUDKIT, er, er.message)
                showErrorToast({
                    text1: er.message,
                    text2: handleCloudKitErrors(er),
                })
                throw er
            }
        },
        [track],
    )

    const getSalt = useCallback(async (_rootAddress: string) => {
        try {
            const salt = await CloudKitManager.getSalt(_rootAddress)
            return salt
        } catch (_error) {
            let er = _error as CKError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            showErrorToast({
                text1: er.message,
                text2: handleCloudKitErrors(er),
            })
        }
    }, [])

    const getIV = useCallback(async (_rootAddress: string) => {
        try {
            const iv = await CloudKitManager.getIV(_rootAddress)
            return iv
        } catch (_error) {
            let er = _error as CKError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            showErrorToast({
                text1: er.message,
                text2: handleCloudKitErrors(er),
            })
        }
    }, [])

    return {
        getCloudKitAvailability,
        saveWalletToCloudKit,
        getAllWalletsFromCloudKit,
        getWalletByRootAddress,
        getSalt,
        getIV,
        deleteWallet,
    }
}
