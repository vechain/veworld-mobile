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
    useCachedObject,
    useStore,
    useStoreObject,
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

    const biometrics = useCachedObject<Biometrics>(
        Biometrics.getName(),
        Biometrics.PrimaryKey(),
    )

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
