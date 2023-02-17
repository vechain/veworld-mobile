import { CryptoUtils, HexUtils } from "~Common/Utils"
import { DEVICE_TYPE } from "~Model"
import { HDNode } from "thor-devkit"
import * as i18n from "~i18n"

/**
 *
 * @param mnemonicPhrase
 * @param deviceIndex
 * @returns
 */
export const getNodes = (mnemonicPhrase: string[], deviceIndex: number) => {
    const hdNode = HDNode.fromMnemonic(mnemonicPhrase)
    const locale = i18n.detectLocale()
    let alias = i18n.i18n()[locale].WALLET_LABEL_wallet()

    const wallet = {
        mnemonic: mnemonicPhrase,
        nonce: HexUtils.generateRandom(256),
        rootAddress: hdNode.address,
    }

    const device = {
        alias: `${alias} ${deviceIndex}`,
        xPub: CryptoUtils.xPubFromHdNode(hdNode),
        rootAddress: hdNode.address,
        type: DEVICE_TYPE.LOCAL_MNEMONIC,
        index: deviceIndex,
        accounts: [],
    }

    return { wallet, device }
}
