import { useMemo, useState } from "react"
import { CryptoUtils, HexUtils } from "~Common/Utils"
import { UserSelectedSecurityLevel, Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
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
    const result4 = useStoreQuery(Config)
    const config = useMemo(() => result4.sorted("_id"), [result4])

    // todo - remove sort when new version is installed
    const result3 = useStoreQuery(Device)
    const devices = useMemo(() => result3.sorted("rootAddress"), [result3])

    // const mnemonic = useCacheObject(Mnemonic, "WALLET_MNEMONIC")
    // todo: this is a workaround until the new version is installed, then use the above
    const result2 = useCachedQuery(Mnemonic)
    const _mnemonic = useMemo(() => result2.sorted("_id"), [result2])

    // const biometrics = useCacheObject(Biometrics, "BIOMETRICS")
    // todo: this is a workaround until the new version is installed, then use the above
    const result1 = useCachedQuery(Biometrics)
    const biometrics = useMemo(() => result1.sorted("_id"), [result1])

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

                const { encryprionKey, encryptedWallet } =
                    await handleEncryption(
                        accessControl,
                        wallet,
                        config[0].isEncryptionKeyCreated,
                    )

                store.write(() => {
                    store.create(RealmClass.Device, {
                        ...device,
                        wallet: encryptedWallet,
                    })
                })

                finilizeSetup(accessControl, encryprionKey)
            }
        } catch (error) {
            console.log("CREATE WALLET ERROR : ", error)
        }
    }
    //* [END] - Create Wallet

    //* [START] - Finilize Wallet Setup
    const finilizeSetup = async (
        accessControl: boolean,
        encryprionKey: string,
    ) => {
        cache.write(() => cache.delete(_mnemonic))

        // If first time creating wallet
        if (!config[0].isEncryptionKeyCreated) {
            await KeychainService.setEncryptionKey(encryprionKey, accessControl)
            store.write(() => {
                config[0].isEncryptionKeyCreated = true
                config[0].userSelectedSecurtiy =
                    UserSelectedSecurityLevel.BIOMETRIC
            })
        }

        setIsComplete(true)
    }
    //* [END] - Finilize Wallet Setup

    return {
        onCreateWallet,
        accessControl: biometrics[0].accessControl,
        isComplete,
    }
}

// CREATE WALLET HELPER FUNCTIONS

/**
 *
 * @param accessControl
 * @param wallet
 * @param isEncryptionKeyCreated
 * @returns
 */
const handleEncryption = async (
    accessControl: boolean, // if biometrics(ios) or if fingerprint (android)
    wallet: Wallet,
    isEncryptionKeyCreated: boolean, // if an encryption key is already generated
) => {
    let encryptedWallet = ""
    let encryprionKey = ""

    if (isEncryptionKeyCreated) {
        let _encryptionKey = await KeychainService.getEncryptionKey(
            accessControl,
        )
        if (_encryptionKey) {
            encryprionKey = _encryptionKey
        }
    } else {
        encryprionKey = HexUtils.generateRandom(8)
    }

    encryptedWallet = CryptoUtils.encrypt<Wallet>(wallet, encryprionKey)

    return { encryprionKey, encryptedWallet }
}
