import { useCallback } from "react"
import { NativeModules } from "react-native"
import { showErrorToast } from "~Components"
import { DerivationPath, ERROR_EVENTS } from "~Constants"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { error, PasswordUtils } from "~Utils"
import { GDError, handleGoogleDriveErrors, isCancelError } from "./ErrorModel"
const { GoogleDriveManager } = NativeModules

export const useGoogleDrive = () => {
    const { LL } = useI18nContext()

    const getGoogleServicesAvailability = useCallback(async () => {
        try {
            return await GoogleDriveManager.checkGoogleServicesAvailability()
        } catch (_error) {
            let er = _error as GDError
            error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
            if (!isCancelError(er.message)) {
                showErrorToast({
                    text1: er.message,
                    text2: handleGoogleDriveErrors(er),
                })
            }
        }
    }, [])

    const deleteWallet = useCallback(async (_rootAddress: string) => {
        try {
            await GoogleDriveManager.deleteWallet(_rootAddress)
            return true
        } catch (err) {
            return false
        }
    }, [])

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
            if (!mnemonic || !_rootAddress || !deviceType || !salt || !iv || !firstAccountAddress) {
                showErrorToast({
                    text1: LL.GOOGLE_DRIVE_ERROR_GENERIC(),
                })
                return
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
            } catch (err) {
                if (!isCancelError((err as GDError).message)) {
                    showErrorToast({
                        text1: LL.GOOGLE_DRIVE_ERROR_GENERIC(),
                    })
                }
            }
        },
        [LL],
    )

    const getAllWalletsFromGoogleDrive = useCallback(async () => {
        try {
            const result = await GoogleDriveManager.getAllWalletsFromGoogleDrive()
            return result
        } catch (err) {
            let er = err as GDError
            error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
            if (!isCancelError(er.message)) {
                showErrorToast({
                    text1: er.message,
                    text2: handleGoogleDriveErrors(er),
                })
            }
            return []
        }
    }, [])

    const getWalletByRootAddress = useCallback(async (_rootAddress?: string) => {
        if (!_rootAddress) {
            return
        }

        try {
            const selectedWallet = await GoogleDriveManager.getWallet(_rootAddress)
            return selectedWallet
        } catch (err) {
            let er = err as GDError
            error(ERROR_EVENTS.GOOGLE_DRIVE, er, er.message)
            if (!isCancelError(er.message)) {
                showErrorToast({
                    text1: er.message,
                    text2: handleGoogleDriveErrors(er),
                })
            }
        }
    }, [])

    const getSalt = useCallback(async (_rootAddress: string) => {
        try {
            const salt = await GoogleDriveManager.getSalt(_rootAddress)
            return salt
        } catch (err) {
            let er = err as GDError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            if (!isCancelError(er.message)) {
                showErrorToast({
                    text1: er.message,
                    text2: handleGoogleDriveErrors(er),
                })
            }
        }
    }, [])

    const getIV = useCallback(async (_rootAddress: string) => {
        try {
            const salt = await GoogleDriveManager.getIV(_rootAddress)
            return salt
        } catch (err) {
            let er = err as GDError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            if (!isCancelError(er.message)) {
                showErrorToast({
                    text1: er.message,
                    text2: handleGoogleDriveErrors(er),
                })
            }
        }
    }, [])

    const googleAccountSignOut = useCallback(async () => {
        try {
            const salt = await GoogleDriveManager.googleAccountSignOut()
            return salt
        } catch (err) {
            let er = err as GDError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            if (!isCancelError(er.message)) {
                showErrorToast({
                    text1: er.message,
                    text2: handleGoogleDriveErrors(er),
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
