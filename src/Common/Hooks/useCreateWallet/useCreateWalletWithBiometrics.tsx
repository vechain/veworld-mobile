import { useMemo, useState } from "react"
import { UserSelectedSecurityLevel } from "~Model"
import {
    Account,
    Biometrics,
    Config,
    Device,
    Mnemonic,
    XPub,
    useCache,
    useCachedQuery,
    useStore,
    useStoreQuery,
} from "~Storage"
import { getDeviceAndAliasIndex, getNodes } from "./Helpers"
import { CryptoUtils } from "~Common/Utils"
import { getAliasName } from "../useCreateAccount/Helpers/getAliasName"

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

                    config[0].userSelectedSecurity =
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
