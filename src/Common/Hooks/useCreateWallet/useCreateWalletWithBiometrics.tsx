import { useCallback, useMemo, useState } from "react"
import { UserSelectedSecurityLevel } from "~Model"
import { Account, Config, Device, Mnemonic, XPub, useRealm } from "~Storage"
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

                    if (config) {
                        config.userSelectedSecurity =
                            UserSelectedSecurityLevel.BIOMETRIC
                    }
                })

                setIsComplete(true)
            }
        } catch (error) {
            console.log("CREATE WALLET ERROR : ", error)
        }
    }, [accessControl, cache, store])
    //* [END] - Create Wallet

    return {
        onCreateWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
