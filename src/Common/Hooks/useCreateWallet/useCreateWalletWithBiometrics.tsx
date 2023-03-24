import { useCallback, useMemo, useState } from "react"
import { SecurityLevelType, UserSelectedSecurityLevel } from "~Model"
import { CryptoUtils } from "~Common/Utils"
import { useBiometrics } from "../useBiometrics"
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
 * useCreateWalletWithBiometrics
 * @returns
 */
export const useCreateWalletWithBiometrics = () => {
    const { getDeviceFromMnemonic } = useDeviceUtils()
    const [isComplete, setIsComplete] = useState(false)

    const biometrics = useBiometrics()
    const accessControl = useMemo(
        () => biometrics?.accessControl,
        [biometrics?.accessControl],
    )

    const dispatch = useAppDispatch()
    const mnemonic = useAppSelector(getMnemonic)
    const selectedAccount = useAppSelector(getSelectedAccount)

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async (onError?: (error: unknown) => void) => {
            try {
                if (mnemonic.value && accessControl) {
                    const { device, wallet } = getDeviceFromMnemonic(
                        mnemonic.value,
                    )

                    dispatch(setMnemonic(undefined))

                    const { encryptedWallet } = await CryptoUtils.encryptWallet(
                        wallet,
                        device.index,
                        accessControl,
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
                        setUserSelectedSecurity(
                            UserSelectedSecurityLevel.BIOMETRIC,
                        ),
                    )

                    dispatch(setLastSecurityLevel(SecurityLevelType.BIOMETRIC))

                    setIsComplete(true)
                } else throw new Error("Mnemonic is not defined")
            } catch (error) {
                console.log("CREATE WALLET ERROR : ", error)
                onError && onError(error)
            }
        },
        [
            accessControl,
            getDeviceFromMnemonic,
            dispatch,
            selectedAccount,
            mnemonic,
        ],
    )
    //* [END] - Create Wallet

    return {
        onCreateWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
