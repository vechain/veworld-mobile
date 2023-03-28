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
import { getSelectedAccount } from "~Storage/Redux/Selectors"
import { error } from "~Common/Logger"

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
    const selectedAccount = useAppSelector(getSelectedAccount)

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async ({
            mnemonic,
            onError,
        }: {
            mnemonic: string
            onError?: (error: unknown) => void
        }) => {
            try {
                if (!accessControl)
                    throw new Error(
                        "Biometrics is not supported: accessControl is !true ",
                    )

                const { device, wallet } = getDeviceFromMnemonic(mnemonic)

                dispatch(setMnemonic(undefined))

                const { encryptedWallet } = await CryptoUtils.encryptWallet({
                    wallet,
                    rootAddress: device.rootAddress,
                    accessControl: true,
                })

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
            } catch (e) {
                error("CREATE WALLET ERROR : ", e)
                onError && onError(e)
            }
        },
        [accessControl, getDeviceFromMnemonic, dispatch, selectedAccount],
    )
    //* [END] - Create Wallet

    return {
        onCreateWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
