import { useCallback, useState } from "react"
import { PasswordUtils, CryptoUtils } from "~Common/Utils"
import {
    SecurityLevelType,
    UserSelectedSecurityLevel,
    WALLET_STATUS,
} from "~Model"
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
 * @description Expose functions to create a local or hardware wallet
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
     * if userPassword is undefined, then use biometrics
     * @param mnemonic mnemonic
     * @param userPassword user password
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
                if (!userPassword && !biometrics?.accessControl)
                    throw new Error(
                        "Biometrics is not supported: accessControl is !true ",
                    )

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
                        setUserSelectedSecurity(
                            UserSelectedSecurityLevel.BIOMETRIC,
                        ),
                    )

                    dispatch(setLastSecurityLevel(SecurityLevelType.BIOMETRIC))
                } else {
                    dispatch(
                        setUserSelectedSecurity(
                            UserSelectedSecurityLevel.PASSWORD,
                        ),
                    )

                    dispatch(setLastSecurityLevel(SecurityLevelType.SECRET))
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
