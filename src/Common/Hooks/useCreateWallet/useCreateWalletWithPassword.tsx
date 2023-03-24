import { useCallback, useState } from "react"
import { PasswordUtils, CryptoUtils } from "~Common/Utils"
import { SecurityLevelType, UserSelectedSecurityLevel } from "~Model"
import {
    Account,
    Device,
    XPub,
    useRealm,
    getUserPreferences,
    getMnemonic,
} from "~Storage"
import { getAliasName } from "../useCreateAccount/Helpers/getAliasName"
import { useDeviceUtils } from "../useDeviceUtils"
import { useAppDispatch } from "~Storage/Redux"
import {
    setLastSecurityLevel,
    setUserSelectedSecurity,
} from "~Storage/Redux/Actions"

/**
 * useCreateWalletWithPassword
 * @returns
 */
export const useCreateWalletWithPassword = () => {
    const { store, cache } = useRealm()
    const { getDeviceFromMnemonic } = useDeviceUtils()

    const [isComplete, setIsComplete] = useState(false)

    const dispatch = useAppDispatch()

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async (userPassword: string, onError?: (error: unknown) => void) => {
            const _mnemonic = getMnemonic(cache)
            let mnemonicPhrase = _mnemonic?.mnemonic

            try {
                if (mnemonicPhrase) {
                    const { device, wallet, deviceIndex } =
                        getDeviceFromMnemonic(mnemonicPhrase)

                    cache.write(() => {
                        mnemonicPhrase = ""
                    })

                    const hashedKey = PasswordUtils.hash(userPassword)
                    const accessControl = false
                    const { encryptedWallet } = await CryptoUtils.encryptWallet(
                        wallet,
                        deviceIndex,
                        accessControl,
                        hashedKey,
                    )

                    store.write(() => {
                        const xPub = store.create<XPub>(XPub.getName(), {
                            ...device.xPub,
                        })

                        let _device = store.create<Device>(Device.getName(), {
                            ...device,
                            xPub,
                            wallet: encryptedWallet,
                        })

                        let account = store.create<Account>(Account.getName(), {
                            address: device.rootAddress,
                            index: 0,
                            visible: true,
                            alias: `${getAliasName} ${1}`,
                        })

                        _device.accounts.push(account)

                        const userPreferences = getUserPreferences(store)
                        if (!userPreferences.selectedAccount)
                            userPreferences.selectedAccount = account

                        dispatch(
                            setUserSelectedSecurity(
                                UserSelectedSecurityLevel.PASSWORD,
                            ),
                        )

                        dispatch(setLastSecurityLevel(SecurityLevelType.SECRET))
                    })

                    setIsComplete(true)
                }
            } catch (error) {
                console.log("CREATE WALLET ERROR : ", error)
                onError && onError(error)
            }
        },
        [cache, getDeviceFromMnemonic, store, dispatch],
    )
    //* [END] - Create Wallet

    return { onCreateWallet, isComplete }
}
