import { useCallback, useState } from "react"
import { PasswordUtils, CryptoUtils } from "~Common/Utils"
import { SecurityLevelType, UserSelectedSecurityLevel } from "~Model"
import { Account, Config, Device, Mnemonic, XPub, useRealm } from "~Storage"
import { getDeviceAndAliasIndex, getNodes } from "./Helpers"
import { getAliasName } from "../useCreateAccount/Helpers/getAliasName"
import { useUserPreferencesEntity } from "../Entities"

/**
 * useCreateWalletWithPassword
 * @returns
 */
export const useCreateWalletWithPassword = () => {
    const { store, cache } = useRealm()

    const [isComplete, setIsComplete] = useState(false)
    const { setSelectedAccount } = useUserPreferencesEntity()

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async (userPassword: string) => {
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
                if (mnemonicPhrase) {
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

                        setSelectedAccount({
                            account,
                            onlyIfNotSetted: true,
                            alreadyInWriteTransaction: true,
                        })

                        if (config) {
                            config.userSelectedSecurity =
                                UserSelectedSecurityLevel.PASSWORD
                            config.lastSecurityLevel = SecurityLevelType.SECRET
                        }
                    })

                    setIsComplete(true)
                }
            } catch (error) {
                console.log("CREATE WALLET ERROR : ", error)
            }
        },
        [cache, store, setSelectedAccount],
    )
    //* [END] - Create Wallet

    return { onCreateWallet, isComplete }
}
