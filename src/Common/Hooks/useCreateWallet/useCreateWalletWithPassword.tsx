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
/**
 * useCreateWalletWithPassword
 * @returns
 */
export const useCreateWalletWithPassword = () => {
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { getDeviceFromMnemonic } = useDeviceUtils()

    const [isComplete, setIsComplete] = useState(false)

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async ({
            mnemonic,
            userPassword,
            onError,
        }: {
            mnemonic: string
            userPassword: string
            onError?: (error: unknown) => void
        }) => {
            try {
                const { device, wallet } = getDeviceFromMnemonic(mnemonic)
                const { encryptedWallet } = await CryptoUtils.encryptWallet({
                    wallet,
                    rootAddress: device.rootAddress,
                    accessControl: false,
                    hashEncryptionKey: PasswordUtils.hash(userPassword),
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

                dispatch(setUserSelectedSecurity(SecurityLevelType.PASSWORD))

                dispatch(setLastSecurityLevel(SecurityLevelType.PASSWORD))
                dispatch(setMnemonic(undefined))

                setIsComplete(true)
            } catch (e) {
                error("CREATE WALLET ERROR : ", e)
                onError && onError(e)
            }
        },
        [dispatch, getDeviceFromMnemonic, selectedAccount],
    )
    //* [END] - Create Wallet

    return { onCreateWallet, isComplete }
}
