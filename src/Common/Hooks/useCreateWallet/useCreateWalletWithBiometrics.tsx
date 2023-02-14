import { useMemo, useState } from "react"
import { UserSelectedSecurityLevel } from "~Model"
import {
    Biometrics,
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
import { CryptoUtils } from "~Common/Utils"

/**
 * useCreateWalletWithBiometrics
 * @returns
 */
export const useCreateWalletWithBiometrics = () => {
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

    // const biometrics = useCacheObject(Biometrics, "BIOMETRICS")
    // todo: this is a workaround until the new version is installed, then use the above
    const biometricsQuery = useCachedQuery(Biometrics)
    const biometrics = useMemo(
        () => biometricsQuery.sorted("_id"),
        [biometricsQuery],
    )

    //* [START] - Create Wallet
    const onCreateWallet = async () => {
        let mnemonicPhrase = _mnemonic[0]?.mnemonic
        let accessControl = biometrics[0].accessControl

        try {
            if (mnemonicPhrase) {
                const deviceIndex = getDeviceIndex(devices)
                const { wallet, device } = getNodes(
                    mnemonicPhrase.split(" "),
                    deviceIndex,
                )

                const { encryptedWallet } = await CryptoUtils.encryptWallet(
                    wallet,
                    device.index,
                    accessControl,
                )

                store.write(() => {
                    store.create(RealmClass.Device, {
                        ...device,
                        wallet: encryptedWallet,
                    })
                    config[0].userSelectedSecurtiy =
                        UserSelectedSecurityLevel.BIOMETRIC
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
        accessControl: biometrics[0].accessControl,
        isComplete,
    }
}
