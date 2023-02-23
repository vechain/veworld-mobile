import { useCallback, useMemo, useState } from "react"
import { PasswordUtils, CryptoUtils } from "~Common/Utils"
import { UserSelectedSecurityLevel } from "~Model"
import {
    Account,
    Config,
    Device,
    Mnemonic,
    XPub,
    useCache,
    useCachedObject,
    useStore,
    useStoreObject,
    useStoreQuery,
} from "~Storage"
import { getDeviceAndAliasIndex, getNodes } from "./Helpers"
import { getAliasName } from "../useCreateAccount/Helpers/getAliasName"

/**
 * useCreateWalletWithPassword
 * @returns
 */
export const useCreateWalletWithPassword = () => {
    const store = useStore()
    const cache = useCache()

    const [isComplete, setIsComplete] = useState(false)

    const config = useStoreObject<Config>(Config.getName(), Config.PrimaryKey())

    const deviceQuery = useStoreQuery(Device)
    const devices = useMemo(
        () => deviceQuery.sorted("rootAddress"),
        [deviceQuery],
    )

    const _mnemonic = useCachedObject<Mnemonic>(
        Mnemonic.getName(),
        Mnemonic.PrimaryKey(),
    )

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async (userPassword: string) => {
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

                    cache.write(() => cache.delete(_mnemonic))

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

                        if (config) {
                            config.userSelectedSecurity =
                                UserSelectedSecurityLevel.PASSWORD
                        }
                    })

                    setIsComplete(true)
                }
            } catch (error) {
                console.log("CREATE WALLET ERROR : ", error)
            }
        },
        [_mnemonic, cache, config, devices, store],
    )
    //* [END] - Create Wallet

    return { onCreateWallet, isComplete }
}
