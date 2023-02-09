import { useCallback, useMemo } from "react"
import { CryptoUtils } from "~Common/Utils"
import { UserSelectedSecurityLevel, Wallet } from "~Model"
import {
    Config,
    Device,
    Mnemonic,
    RealmClass,
    useCache,
    useCachedQuery,
    useStore,
    useStoreQuery,
} from "~Storage"
import { getDeviceIndex, getNodes } from "./Helpers"

/**
 * useCreateWalletWithPassword
 * @returns
 */
export const useCreateWalletWithPassword = () => {
    const store = useStore()
    const cache = useCache()

    // const config = useCacheObject(Config, "APP_CONFIG")
    // todo: this is a workaround until the new version is installed, then use the above
    const result4 = useStoreQuery(Config)
    const config = useMemo(() => result4.sorted("_id"), [result4])

    // todo - remove sort when new version is installed
    const result3 = useStoreQuery(Device)
    const devices = useMemo(() => result3.sorted("rootAddress"), [result3])

    // const mnemonic = useCacheObject(Mnemonic, "WALLET_MNEMONIC")
    // todo: this is a workaround until the new version is installed, then use the above
    const result2 = useCachedQuery(Mnemonic)
    const _mnemonic = useMemo(() => result2.sorted("_id"), [result2])

    //* [START] - Create Wallet
    const onCreateWallet = useCallback(
        async (userPassword: string) => {
            let mnemonicPhrase = _mnemonic[0]?.mnemonic

            try {
                if (mnemonicPhrase) {
                    const deviceIndex = getDeviceIndex(devices)
                    const { wallet, device } = getNodes(
                        mnemonicPhrase.split(" "),
                        deviceIndex,
                    )
                    const { encryptedWallet } = await handleEncryptrion(
                        wallet,
                        userPassword,
                    )

                    store.write(() => {
                        store.create(RealmClass.Device, {
                            ...device,
                            wallet: encryptedWallet,
                        })
                    })

                    cache.write(() => cache.delete(_mnemonic))

                    if (config[0].isFirstAppLoad) {
                        store.write(() => {
                            config[0].isFirstAppLoad = false
                            config[0].userSelectedSecurtiy =
                                UserSelectedSecurityLevel.PASSWORD
                            config[0].isWallet = true
                        })
                    }
                }
            } catch (error) {
                console.log("CREATE WALLET ERROR : ", error)
            }
        },
        [_mnemonic, cache, config, devices, store],
    )
    //* [END] - Create Wallet

    return { onCreateWallet }
}

/**
 *
 * @param accessControl
 * @param userSelectedSecurtiy
 * @param wallet
 * @param isEncryptionKey
 * @param userPassword
 * @returns
 */
const handleEncryptrion = async (wallet: Wallet, userPassword: string) => {
    let encryptedWallet = CryptoUtils.encrypt(wallet, userPassword)
    return { undefined, encryptedWallet }
}
