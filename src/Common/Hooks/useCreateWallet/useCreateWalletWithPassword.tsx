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
import { getMnemonic, getSelectedAccount } from "~Storage/Redux/Selectors"

/**
 * useCreateWalletWithPassword
 * @returns
 */
export const useCreateWalletWithPassword = () => {
    const { getDeviceFromMnemonic } = useDeviceUtils()

    const [isComplete, setIsComplete] = useState(false)

    const dispatch = useAppDispatch()
    const mnemonic = useAppSelector(getMnemonic)
    const selectedAccount = useAppSelector(getSelectedAccount)

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async (userPassword: string, onError?: (error: unknown) => void) => {
            try {
                if (mnemonic) {
                    const { device, wallet, deviceIndex } =
                        getDeviceFromMnemonic(mnemonic)

                    dispatch(setMnemonic(undefined))

                    const hashedKey = PasswordUtils.hash(userPassword)
                    const accessControl = false

                    await CryptoUtils.encryptWallet(
                        wallet,
                        deviceIndex,
                        accessControl,
                        hashedKey,
                    )

                    const newAccount = dispatch(addDeviceAndAccounts(device))
                    if (!selectedAccount)
                        dispatch(selectAccount({ address: newAccount.address }))

                    dispatch(
                        setUserSelectedSecurity(
                            UserSelectedSecurityLevel.PASSWORD,
                        ),
                    )

                    dispatch(setLastSecurityLevel(SecurityLevelType.SECRET))

                    setIsComplete(true)
                }
            } catch (error) {
                console.log("CREATE WALLET ERROR : ", error)
                onError && onError(error)
            }
        },
        [dispatch, mnemonic, getDeviceFromMnemonic, selectedAccount],
    )
    //* [END] - Create Wallet

    return { onCreateWallet, isComplete }
}
