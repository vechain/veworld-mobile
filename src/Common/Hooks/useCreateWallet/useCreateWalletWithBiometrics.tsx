import { useCallback, useMemo, useState } from "react"
import { SecurityLevelType, UserSelectedSecurityLevel } from "~Model"
import {
    Account,
    Device,
    XPub,
    useRealm,
    getUserPreferences,
    getConfig,
    getMnemonic,
} from "~Storage"
import { CryptoUtils } from "~Common/Utils"
import { getAliasName } from "../useCreateAccount/Helpers/getAliasName"
import { useBiometrics } from "../useBiometrics"
import { useDeviceUtils } from "../useDeviceUtils"

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

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async (onError?: (error: unknown) => void) => {
            const config = getConfig(store)

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

                        if (config) {
                            config.userSelectedSecurity =
                                UserSelectedSecurityLevel.BIOMETRIC
                            config.lastSecurityLevel =
                                SecurityLevelType.BIOMETRIC
                        }
                    })

                    setIsComplete(true)
                }
            } catch (error) {
                console.log("CREATE WALLET ERROR : ", error)
                onError && onError(error)
            }
        },
        [accessControl, cache, store, getDeviceFromMnemonic],
    )
    //* [END] - Create Wallet

    return {
        onCreateWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
