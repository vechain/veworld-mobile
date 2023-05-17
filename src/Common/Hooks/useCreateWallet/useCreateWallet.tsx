import { useCallback, useState } from "react"
import { PasswordUtils, CryptoUtils } from "~Common/Utils"
import { SecurityLevelType, WALLET_STATUS } from "~Model"
import { useDeviceUtils } from "../useDeviceUtils"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    addDeviceAndAccounts,
    selectAccount,
    setLastSecurityLevel,
    setUserSelectedSecurity,
    setMnemonic,
    setAppLockStatus,
} from "~Storage/Redux/Actions"
import { selectSelectedAccount } from "~Storage/Redux/Selectors"
import { error } from "~Common/Logger"
import { useBiometrics } from "../useBiometrics"
/**
 * useCreateWallet
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

                // if userPassword is undefined, then use biometrics
                if (!userPassword) {
                    dispatch(
                        setUserSelectedSecurity(SecurityLevelType.BIOMETRICS),
                    )

                    dispatch(setLastSecurityLevel(SecurityLevelType.BIOMETRICS))
                } else {
                    dispatch(
                        setUserSelectedSecurity(SecurityLevelType.PASSWORD),
                    )

                    dispatch(setLastSecurityLevel(SecurityLevelType.PASSWORD))
                }

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
