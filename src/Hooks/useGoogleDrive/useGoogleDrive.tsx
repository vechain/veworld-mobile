import { useCallback, useState } from "react"
import { NativeModules } from "react-native"
import { showErrorToast } from "~Components"
import { DerivationPath, ERROR_EVENTS } from "~Constants"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { error, PasswordUtils } from "~Utils"
import { GDError, handleGoogleDriveErrors, OAUTH_INTERRUPTED } from "./ErrorModel"
const { GoogleDriveManager } = NativeModules

export const useGoogleDrive = () => {
    const { LL } = useI18nContext()
    const [isWalletBackedUp, setIsWalletBackedUp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const isCancelError = (message: string) => {
        return message === OAUTH_INTERRUPTED
    }

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
        setIsLoading(true)
        try {
            await GoogleDriveManager.deleteWallet(_rootAddress)
            return true
        } catch (err) {
            return false
        } finally {
            setIsLoading(false)
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

            setIsLoading(true)

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
            } finally {
                setIsLoading(false)
            }
        },
        [LL],
    )

    const getAllWalletsFromGoogleDrive = useCallback(async () => {
        setIsLoading(true)

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
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getWalletByRootAddress = useCallback(async (_rootAddress: string) => {
        setIsLoading(true)

        try {
            const selectedWallet = await GoogleDriveManager.getWallet(_rootAddress)
            setIsWalletBackedUp(!!selectedWallet?.rootAddress)
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
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getSalt = useCallback(async (_rootAddress: string) => {
        setIsLoading(true)
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
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getIV = useCallback(async (_rootAddress: string) => {
        setIsLoading(true)
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
        } finally {
            setIsLoading(false)
        }
    }, [])

    const googleAccountSignOut = useCallback(async () => {
        setIsLoading(true)
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
        } finally {
            setIsLoading(false)
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
        isWalletBackedUp,
        isLoading,
        googleAccountSignOut,
    }
}
