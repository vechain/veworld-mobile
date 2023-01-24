import { mnemonic, HDNode } from "thor-devkit"
import { AsyncStoreType, CryptoUtils, HexUtils, error } from "~Common"
import { DEVICE_TYPE, Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
import { setMnemonic, purgeWalletState, AppThunk } from "~Storage/Caches"
import { AsyncStore } from "~Storage/Stores"
import * as i18n from "~i18n"

export const generateMnemonicPhrase = (): string[] => mnemonic.generate()

const createMnemonicWallet =
    (realm: Realm, userPassword?: string): AppThunk<void> =>
    async (dispatch, getState) => {
        try {
            let mnemonicPhrase = getState().walletState.mnemonic.split(" ")
            let accessControl = getState().biometricsState.accessControl

            const { wallet, device } = await getNodes(mnemonicPhrase)
            const { encryprionKey, encryptedWallet } = await handleEncryptrion(
                accessControl,
                wallet,
                userPassword,
            )

            realm.write(() => {
                realm.create("Device", {
                    ...device,
                    wallet: encryptedWallet,
                })
            })

            await finilizeSetup(userPassword, encryprionKey, accessControl)
            dispatch(purgeWalletState())
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

const getNodes = async (mnemonicPhrase: string[]) => {
    const hdNode = HDNode.fromMnemonic(mnemonicPhrase)
    const locale = i18n.detectLocale()
    let alias = i18n.i18n()[locale].WALLET_LABEL_account()

    const wallet = {
        mnemonic: mnemonicPhrase,
        nonce: HexUtils.generateRandom(256),
        rootAddress: hdNode.address,
    }

    let deviceIndex = await getDeviceIndex()
    const device = {
        alias: `${alias} ${deviceIndex}`,
        xPub: CryptoUtils.xPubFromHdNode(hdNode),
        rootAddress: hdNode.address,
        type: DEVICE_TYPE.LOCAL_MNEMONIC,
    }

    return { wallet, device }
}

const handleEncryptrion = async (
    accessControl: boolean | undefined,
    wallet: Wallet,
    userPassword?: string,
) => {
    let encryprionKey: string | undefined

    if (!userPassword) {
        encryprionKey = await KeychainService.getOrGenerateEncryptionKey(
            accessControl!,
        )
    }

    const encryptedWallet = CryptoUtils.encrypt(
        wallet,
        userPassword || encryprionKey!,
    )

    return { encryprionKey, encryptedWallet }
}

const finilizeSetup = async (
    userPassword?: string,
    encryprionKey?: string,
    accessControl?: boolean,
) => {
    await updateDeviceIndex()
    let isKey = await AsyncStore.getFor<string>(AsyncStoreType.IsEncryptionKey)
    // Set encryption key only the first time and only if is biometrics
    if (!isKey && !userPassword) {
        await KeychainService.setEncryptionKey(encryprionKey!, accessControl!)
        await AsyncStore.set<string>("YES", AsyncStoreType.IsEncryptionKey)
        await AsyncStore.set<string>("YES", AsyncStoreType.IsFirstAppLoad)
    }
}

export default {
    generateMnemonicPhrase,
    setMnemonic,
    purgeWalletState,
    createMnemonicWallet,
    updateDeviceIndex,
}
