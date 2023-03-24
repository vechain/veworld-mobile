import { useCallback, useMemo, useState } from "react"
import { SecurityLevelType, UserSelectedSecurityLevel } from "~Model"
import {
    Account,
    Device,
    XPub,
    useRealm,
    getUserPreferences,
    getMnemonic,
} from "~Storage"
import { CryptoUtils } from "~Common/Utils"
import { getAliasName } from "../useCreateAccount/Helpers/getAliasName"
import { useBiometrics } from "../useBiometrics"
import { useDeviceUtils } from "../useDeviceUtils"
import { useAppDispatch } from "~Storage/Redux"
import {
    setLastSecurityLevel,
    setUserSelectedSecurity,
} from "~Storage/Redux/Actions"

/**
 * useCreateWalletWithBiometrics
 * @returns
 */
export const useCreateWalletWithBiometrics = () => {
    const { store, cache } = useRealm()

    const { getDeviceFromMnemonic } = useDeviceUtils()
    const [isComplete, setIsComplete] = useState(false)

    const biometrics = useBiometrics()
    const accessControl = useMemo(
        () => biometrics?.accessControl,
        [biometrics?.accessControl],
    )

    const dispatch = useAppDispatch()

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async (onError?: (error: unknown) => void) => {
            const _mnemonic = getMnemonic(cache)

            let mnemonicPhrase = _mnemonic?.mnemonic

            try {
                if (mnemonicPhrase && accessControl) {
                    const { device, wallet } =
                        getDeviceFromMnemonic(mnemonicPhrase)

                    cache.write(() => {
                        _mnemonic!.mnemonic = ""
                    })

                    const { encryptedWallet } = await CryptoUtils.encryptWallet(
                        wallet,
                        device.index,
                        accessControl,
                    )

                    store.write(() => {
                        const xPub = store.create<XPub>(XPub.getName(), {
                            ...device.xPub,
                        })

                        const _device = store.create<Device>(Device.getName(), {
                            ...device,
                            xPub,
                            wallet: encryptedWallet,
                        })

                        const account = store.create<Account>(
                            Account.getName(),
                            {
                                address: device.rootAddress,
                                index: 0,
                                visible: true,
                                alias: `${getAliasName} ${1}`,
                            },
                        )

                        _device.accounts.push(account)

                        const userPreferences = getUserPreferences(store)
                        if (!userPreferences.selectedAccount)
                            userPreferences.selectedAccount = account

                        dispatch(
                            setUserSelectedSecurity(
                                UserSelectedSecurityLevel.BIOMETRIC,
                            ),
                        )

                        dispatch(
                            setLastSecurityLevel(SecurityLevelType.BIOMETRIC),
                        )
                    })

                    setIsComplete(true)
                }
            } catch (error) {
                console.log("CREATE WALLET ERROR : ", error)
                onError && onError(error)
            }
        },
        [cache, accessControl, getDeviceFromMnemonic, store, dispatch],
    )
    //* [END] - Create Wallet

    return {
        onCreateWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
