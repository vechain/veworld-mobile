import { HDNode } from "thor-devkit"
import { CryptoUtils } from "~Common/Utils"
import { DEVICE_TYPE } from "~Model"
import { getNodes } from "./getNodes"

jest.mock("~i18n", () => ({
    detectLocale: jest.fn().mockReturnValue("en-US"),
    i18n: () => ({
        "en-US": {
            WALLET_LABEL_WALLET: () => "Wallet",
        },
    }),
}))

describe("getNodes", () => {
    it("should return the correct wallet and device objects", () => {
        const mnemonicPhrase = [
            "juice",
            "direct",
            "sell",
            "apart",
            "motion",
            "polar",
            "copper",
            "air",
            "novel",
            "dumb",
            "slender",
            "flash",
            "feature",
            "early",
            "feel",
        ]
        const deviceIndex = 1
        const aliasIndex = 2
        const hdNode = HDNode.fromMnemonic(mnemonicPhrase)
        const expectedXPub = CryptoUtils.xPubFromHdNode(hdNode)

        const result = getNodes(mnemonicPhrase, deviceIndex, aliasIndex)

        expect(result.wallet.mnemonic).toEqual(mnemonicPhrase)
        expect(result.wallet.nonce).toHaveLength(258)
        expect(result.wallet.rootAddress).toEqual(hdNode.address)

        expect(result.device.alias).toEqual("Wallet 2")
        expect(result.device.xPub).toEqual(expectedXPub)
        expect(result.device.rootAddress).toEqual(hdNode.address)
        expect(result.device.type).toEqual(DEVICE_TYPE.LOCAL_MNEMONIC)
        expect(result.device.index).toEqual(deviceIndex)
    })
})
