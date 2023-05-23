import { CryptoUtils, HexUtils } from "~Utils"
import { Device, DEVICE_TYPE } from "~Model"
import { HDNode } from "thor-devkit"
import * as i18n from "~i18n"

type GetNodesResult = {
    wallet: {
        mnemonic: string[]
        nonce: string
        rootAddress: string
    }
    device: Omit<Device, "wallet">
}
/**
 *
 * @param mnemonicPhrase
 * @param deviceIndex
 * @returns {wallet, device}
 */
export const getNodes = (
    mnemonicPhrase: string[],
    deviceIndex: number,
    aliasIndex: number,
): GetNodesResult => {
    const hdNode = HDNode.fromMnemonic(mnemonicPhrase)
    const locale = i18n.detectLocale()
    let alias = i18n.i18n()[locale].WALLET_LABEL_WALLET()

    const wallet = {
        mnemonic: mnemonicPhrase,
        nonce: HexUtils.generateRandom(256),
        rootAddress: hdNode.address,
    }

    const device = {
        alias: `${alias} ${aliasIndex}`,
        xPub: CryptoUtils.xPubFromHdNode(hdNode),
        rootAddress: hdNode.address,
        type: DEVICE_TYPE.LOCAL_MNEMONIC,
        index: deviceIndex,
    }

    return { wallet, device }
}
