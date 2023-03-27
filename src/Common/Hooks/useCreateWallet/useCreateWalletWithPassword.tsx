import { useCallback, useState } from "react"
import { PasswordUtils, CryptoUtils } from "~Common/Utils"
import { SecurityLevelType, UserSelectedSecurityLevel } from "~Model"
import { useDeviceUtils } from "../useDeviceUtils"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    addDeviceAndAccounts,
    selectAccount,
    setLastSecurityLevel,
    setUserSelectedSecurity,
    setMnemonic,
} from "~Storage/Redux/Actions"
import { getSelectedAccount } from "~Storage/Redux/Selectors"

/**
 * useCreateWalletWithPassword
 * @returns
 */
export const useCreateWalletWithPassword = () => {
    const { getDeviceFromMnemonic } = useDeviceUtils()

    const [isComplete, setIsComplete] = useState(false)

    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(getSelectedAccount)

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
                const { device, wallet, deviceIndex } =
                    getDeviceFromMnemonic(mnemonic)

                dispatch(setMnemonic(undefined))

                const hashedKey = PasswordUtils.hash(userPassword)
                const accessControl = false

                const { encryptedWallet } = await CryptoUtils.encryptWallet(
                    wallet,
                    deviceIndex,
                    accessControl,
                    hashedKey,
                )

                const newAccount = dispatch(
                    addDeviceAndAccounts({
                        ...device,
                        wallet: encryptedWallet,
                    }),
                )
                if (!selectedAccount)
                    dispatch(selectAccount({ address: newAccount.address }))

                dispatch(
                    setUserSelectedSecurity(UserSelectedSecurityLevel.PASSWORD),
                )

                dispatch(setLastSecurityLevel(SecurityLevelType.SECRET))

                setIsComplete(true)
            } catch (error) {
                console.log("CREATE WALLET ERROR : ", error)
                onError && onError(error)
            }
        },
        [dispatch, getDeviceFromMnemonic, selectedAccount],
    )
    //* [END] - Create Wallet

    return { onCreateWallet, isComplete }
}
