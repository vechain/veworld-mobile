import { mnemonic, HDNode } from "thor-devkit"
import { AsyncStoreType, CryptoUtils, HexUtils, error } from "~Common"
import { DEVICE_TYPE } from "~Model"
import KeychainService from "~Services/KeychainService"
import { setMnemonic, purgeWalletState, AppThunk } from "~Storage/Caches"
import { AsyncStore } from "~Storage/Stores"

export const generateMnemonicPhrase = (): string[] => mnemonic.generate()

const createMnemonicWallet =
    (
        alias: string,
        mnemonicPhrase: string[],
        realm: Realm,
        accessControl: boolean,
    ): AppThunk<void> =>
    async dispatch => {
        try {
            if (mnemonicPhrase.length !== 12) {
                error("mnemonicPhrase.length !== 12")
                return
            }

            const hdNode = HDNode.fromMnemonic(mnemonicPhrase)

            const wallet = {
                mnemonic: mnemonicPhrase,
                nonce: HexUtils.generateRandom(256),
                rootAddress: hdNode.address,
            }

            let deviceIndex = await getDeviceIndex()
            const _device = {
                alias: `${alias} ${deviceIndex}`,
                xPub: CryptoUtils.xPubFromHdNode(hdNode),
                rootAddress: hdNode.address,
                type: DEVICE_TYPE.LOCAL_MNEMONIC,
            }

            let encryprionKey = await KeychainService.getEncryptionKey(
                accessControl,
            )

            const encryptedWallet = CryptoUtils.encrypt(wallet, encryprionKey!)
            let device = {
                ..._device,
                wallet: encryptedWallet,
            }

            realm.write(() => {
                realm.create("Device", device)
            })

            await updateDeviceIndex()
            dispatch(purgeWalletState())
            await KeychainService.setEncryptionKey(
                encryprionKey!,
                accessControl,
            )
        } catch (e) {
            error(e)
        }
    }

const getDeviceIndex = async () => {
    let lastIndex = await AsyncStore.getFor<string>(AsyncStoreType.DeviceIndex)
    if (lastIndex) {
        let newIndex = parseInt(lastIndex, 10)
        return newIndex + 1
    }
    return 1
}

const updateDeviceIndex = async () => {
    let lastIndex = await AsyncStore.getFor<string>(AsyncStoreType.DeviceIndex)
    if (lastIndex) {
        let newIndex = parseInt(lastIndex, 10)
        await AsyncStore.set<string>(
            JSON.stringify(newIndex + 1),
            AsyncStoreType.DeviceIndex,
        )
        return
    }
    await AsyncStore.set<string>("1", AsyncStoreType.DeviceIndex)
}

export default {
    generateMnemonicPhrase,
    setMnemonic,
    purgeWalletState,
    createMnemonicWallet,
    updateDeviceIndex,
}
