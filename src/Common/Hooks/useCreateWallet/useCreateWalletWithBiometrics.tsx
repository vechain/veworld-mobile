import { useCallback, useMemo, useState } from "react"
import { SecurityLevelType, UserSelectedSecurityLevel } from "~Model"
import {
    Account,
    Config,
    Device,
    Mnemonic,
    XPub,
    useRealm,
    SelectedAccount,
} from "~Storage"
import { getDeviceAndAliasIndex, getNodes } from "./Helpers"
import { CryptoUtils } from "~Common/Utils"
import { getAliasName } from "../useCreateAccount/Helpers/getAliasName"
import { useBiometrics } from "../useBiometrics"

/**
 * useCreateWalletWithBiometrics
 * @returns
 */
export const useCreateWalletWithBiometrics = () => {
    const { store, cache } = useRealm()

    const [isComplete, setIsComplete] = useState(false)

    const biometrics = useBiometrics()
    const accessControl = useMemo(
        () => biometrics?.accessControl,
        [biometrics?.accessControl],
    )

    const setSelectedAccountIfNotSetted = useCallback(
        (account: Account) => {
            const selectedAccount = store.objectForPrimaryKey<SelectedAccount>(
                SelectedAccount.getName(),
                SelectedAccount.getPrimaryKey(),
            )
            if (selectedAccount && !selectedAccount.address) {
                selectedAccount.address = account.address
            }
        },
        [store],
    )

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(async () => {
        const config = store.objectForPrimaryKey<Config>(
            Config.getName(),
            Config.getPrimaryKey(),
        )

        const devices = store.objects<Device>(Device.getName())

        const _mnemonic = cache.objectForPrimaryKey<Mnemonic>(
            Mnemonic.getName(),
            Mnemonic.getPrimaryKey(),
        )

        let mnemonicPhrase = _mnemonic?.mnemonic

        try {
            if (mnemonicPhrase && accessControl) {
                const { deviceIndex, aliasIndex } =
                    getDeviceAndAliasIndex(devices)

                const { wallet, device } = getNodes(
                    mnemonicPhrase.split(" "),
                    deviceIndex,
                    aliasIndex,
                )

                cache.write(() => {
                    mnemonicPhrase = ""
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

                    const account = store.create<Account>(Account.getName(), {
                        address: device.rootAddress,
                        index: 0,
                        visible: true,
                        alias: `${getAliasName} ${1}`,
                    })

                    _device.accounts.push(account)

                    setSelectedAccountIfNotSetted(account)

                    if (config) {
                        config.userSelectedSecurity =
                            UserSelectedSecurityLevel.BIOMETRIC
                        config.lastSecurityLevel = SecurityLevelType.BIOMETRIC
                    }
                })

                setIsComplete(true)
            }
        } catch (error) {
            console.log("CREATE WALLET ERROR : ", error)
        }
    }, [accessControl, cache, store, setSelectedAccountIfNotSetted])
    //* [END] - Create Wallet

    return {
        onCreateWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
