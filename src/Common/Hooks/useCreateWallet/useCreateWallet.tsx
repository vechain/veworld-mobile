import { useCallback, useState } from "react"
import { PasswordUtils, CryptoUtils } from "~Common/Utils"
import { WALLET_STATUS } from "~Model"
import { useDeviceUtils } from "../useDeviceUtils"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    addDeviceAndAccounts,
    selectAccount,
    setMnemonic,
    setAppLockStatus,
} from "~Storage/Redux/Actions"
import { selectSelectedAccount } from "~Storage/Redux/Selectors"
import { error } from "~Common/Logger"
import { useBiometrics } from "../useBiometrics"
/**
 * useCreateWallet is a hook that allows you to create a wallet and store it in the store
 * @example const { onCreateWallet, accessControl, isComplete } = useCreateWallet()
 * @returns { onCreateWallet, accessControl, isComplete }
 * @category Hooks
 * @returns
 */
export const useCreateWallet = () => {
    const { getDeviceFromMnemonic } = useDeviceUtils()
    const biometrics = useBiometrics()
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const [isComplete, setIsComplete] = useState(false)

    /**
     * Insert new wallet in store
     * if userPassword is provided, encrypt the wallet with it and store the hash
     * @param mnemonic mnemonic
     * @param userPassword optional user password to encrypt the wallet
     * @param onError callback called if erorr
     * @returns void
     */
    const onCreateWallet = useCallback(
        async ({
            mnemonic,
            userPassword,
            onError,
        }: {
            mnemonic: string
            userPassword?: string
            onError?: (error: unknown) => void
        }) => {
            try {
                const { device, wallet } = getDeviceFromMnemonic(mnemonic)
                dispatch(setMnemonic(undefined))

                const { encryptedWallet } = await CryptoUtils.encryptWallet({
                    wallet,
                    rootAddress: device.rootAddress,
                    accessControl: biometrics?.accessControl || false,
                    hashEncryptionKey: userPassword
                        ? PasswordUtils.hash(userPassword)
                        : undefined,
                })

                const newAccount = dispatch(
                    addDeviceAndAccounts({
                        ...device,
                        wallet: encryptedWallet,
                    }),
                )

                dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))

                if (!selectedAccount)
                    dispatch(selectAccount({ address: newAccount.address }))

                setIsComplete(true)
            } catch (e) {
                error("CREATE WALLET ERROR : ", e)
                onError && onError(e)
            }
        },
        [dispatch, biometrics, getDeviceFromMnemonic, selectedAccount],
    )
    //* [END] - Create Wallet

    return {
        onCreateWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
