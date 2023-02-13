import { useCallback, useMemo, useState } from "react"
import { PasswordUtils } from "~Common/Utils"
import { UserSelectedSecurityLevel } from "~Model"
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
import { encryptWallet } from "~Common/Utils/CryptoUtils/CryptoUtils"

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
    const configQuery = useStoreQuery(Config)
    const config = useMemo(() => configQuery.sorted("_id"), [configQuery])

    // todo - remove sort when new version is installed
    const deviceQuery = useStoreQuery(Device)
    const devices = useMemo(
        () => deviceQuery.sorted("rootAddress"),
        [deviceQuery],
    )

    // const mnemonic = useCacheObject(Mnemonic, "WALLET_MNEMONIC")
    // todo: this is a workaround until the new version is installed, then use the above
    const mnemonicQuery = useCachedQuery(Mnemonic)
    const _mnemonic = useMemo(
        () => mnemonicQuery.sorted("_id"),
        [mnemonicQuery],
    )

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
                    cache.write(() => cache.delete(_mnemonic))

                    const hashedKey = PasswordUtils.hash(userPassword)

                    const { encryptedWallet } = await encryptWallet(
                        wallet,
                        deviceIndex,
                        false,
                        hashedKey,
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
