import { useCallback, useMemo, useState } from "react"
import { CryptoUtils, HexUtils, PasswordUtils } from "~Common/Utils"
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
import KeychainService from "~Services/KeychainService"

/**
 * useCreateWalletWithPassword
 * @returns
 */
export const useCreateWalletWithPassword = () => {
    const store = useStore()
    const cache = useCache()

    const [isComplete, setIsComplete] = useState(false)

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

                    const hashedKey = PasswordUtils.hash(userPassword)
                    const { encryptionKey, encryptedWallet } =
                        await handleEncryptrion(wallet)

                    cache.write(() => cache.delete(_mnemonic))

                    const encryptedKey = CryptoUtils.encrypt<string>(
                        encryptionKey,
                        hashedKey,
                    )

                    await KeychainService.setEncryptionKey(
                        encryptedKey,
                        deviceIndex,
                    )

                    store.write(() => {
                        config[0].userSelectedSecurtiy =
                            UserSelectedSecurityLevel.PASSWORD

                        store.create(RealmClass.Device, {
                            ...device,
                            wallet: encryptedWallet,
                        })
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

/**
 *
 * @param wallet
 * @param userPassword
 * @returns
 */
const handleEncryptrion = async (wallet: Wallet) => {
    let encryptionKey = HexUtils.generateRandom(8)
    let encryptedWallet = CryptoUtils.encrypt<Wallet>(wallet, encryptionKey)
    return { encryptionKey, encryptedWallet }
}
