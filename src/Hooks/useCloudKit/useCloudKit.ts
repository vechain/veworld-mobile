import { useCallback, useEffect, useState } from "react"
import { NativeModules } from "react-native"
import { showErrorToast } from "~Components"
import { DerivationPath, ERROR_EVENTS } from "~Constants"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { PasswordUtils, error } from "~Utils"
import { CKError, handleCloudKitErrors } from "./ErrorModel"
const { CloudKitManager } = NativeModules

export const useCloudKit = () => {
    const { LL } = useI18nContext()
    const [isAvailable, setisAvailable] = useState(false)
    const [isWalletBackedUp, setIsWalletBackedUp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const getCloudKitAvailability = useCallback(async () => await CloudKitManager.checkCloudKitAvailability(), [])

    const deleteWallet = useCallback(async (_rootAddress: string) => {
        setIsLoading(true)
        const delWAllet = await CloudKitManager.deleteWallet(_rootAddress)
        const delSalt = await CloudKitManager.deleteSalt(_rootAddress)
        const delIV = await CloudKitManager.deleteIV(_rootAddress)
        setIsLoading(false)
        return delWAllet && delSalt && delIV
    }, [])

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
            if (!mnemonic || !_rootAddress || !deviceType || !salt || !iv || !firstAccountAddress) {
                showErrorToast({
                    text1: LL.CLOUDKIT_ERROR_GENERIC(),
                })
                return
            }

            setIsLoading(true)

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
                        setIsLoading(false)
                        return
                    }
                }
            } catch (_error: unknown) {
                await deleteWallet(_rootAddress)
                setIsLoading(false)
                let er = _error as CKError
                error(ERROR_EVENTS.CLOUDKIT, er, er.message)
                showErrorToast({
                    text1: er.message,
                    text2: handleCloudKitErrors(er),
                })
            }
        },
        [LL, deleteWallet],
    )

    const getAllWalletsFromCloudKit = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await CloudKitManager.getAllFromCloudKit()
            setIsLoading(false)
            return result
        } catch (_error) {
            setIsLoading(false)
            let er = _error as CKError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            showErrorToast({
                text1: er.message,
                text2: handleCloudKitErrors(er),
            })
        }
    }, [])

    const getWalletByRootAddress = useCallback(
        async (_rootAddress: string) => {
            if (!isAvailable) return
            setIsLoading(true)
            try {
                const selectedWallet = await CloudKitManager.getWallet(_rootAddress)
                setIsWalletBackedUp(!!selectedWallet?.rootAddress)
                setIsLoading(false)
                return selectedWallet
            } catch (_error) {
                setIsLoading(false)
                let er = _error as CKError
                error(ERROR_EVENTS.CLOUDKIT, er, er.message)
                showErrorToast({
                    text1: er.message,
                    text2: handleCloudKitErrors(er),
                })
            }
        },
        [isAvailable],
    )

    const getSalt = useCallback(async (_rootAddress: string) => {
        setIsLoading(true)
        try {
            return await CloudKitManager.getSalt(_rootAddress)
        } catch (_error) {
            setIsLoading(false)
            let er = _error as CKError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            showErrorToast({
                text1: er.message,
                text2: handleCloudKitErrors(er),
            })
        }
    }, [])

    const getIV = useCallback(async (_rootAddress: string) => {
        setIsLoading(true)
        try {
            return await CloudKitManager.getIV(_rootAddress)
        } catch (_error) {
            setIsLoading(false)
            let er = _error as CKError
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            showErrorToast({
                text1: er.message,
                text2: handleCloudKitErrors(er),
            })
        }
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
        deleteWallet,
    }
}
