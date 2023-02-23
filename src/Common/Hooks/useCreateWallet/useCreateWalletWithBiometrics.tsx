import { useState } from "react"
import { UserSelectedSecurityLevel } from "~Model"
import {
    Account,
    Biometrics,
    Config,
    Device,
    Mnemonic,
    XPub,
    useObjectListener,
    useRealm,
} from "~Storage"
import { getDeviceAndAliasIndex, getNodes } from "./Helpers"
import { CryptoUtils } from "~Common/Utils"
import { getAliasName } from "../useCreateAccount/Helpers/getAliasName"

/**
 * useCreateWalletWithBiometrics
 * @returns
 */
export const useCreateWalletWithBiometrics = () => {
    const { store, cache } = useRealm()

    const [isComplete, setIsComplete] = useState(false)

    const config = store.objectForPrimaryKey<Config>(
        Config.getName(),
        Config.PrimaryKey(),
    )

    const devices = store.objects<Device>(Device.getName())

    const _mnemonic = cache.objectForPrimaryKey<Mnemonic>(
        Mnemonic.getName(),
        Mnemonic.PrimaryKey(),
    )

    const biometrics = useObjectListener(
        Biometrics.getName(),
        Biometrics.PrimaryKey(),
        cache,
    ) as Biometrics

    //* [START] - Create Wallet
    const onCreateWallet = async () => {
        let mnemonicPhrase = _mnemonic?.mnemonic
        let accessControl = biometrics?.accessControl

        try {
            if (mnemonicPhrase && accessControl) {
                const { deviceIndex, aliasIndex } =
                    getDeviceAndAliasIndex(devices)

                const { wallet, device } = getNodes(
                    mnemonicPhrase.split(" "),
                    deviceIndex,
                    aliasIndex,
                )

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

                cache.write(() => cache.delete(_mnemonic))

                setIsComplete(true)
            }
        } catch (error) {
            console.log("CREATE WALLET ERROR : ", error)
        }
    }
    //* [END] - Create Wallet

    return {
        onCreateWallet,
        accessControl: biometrics?.accessControl,
        isComplete,
    }
}
