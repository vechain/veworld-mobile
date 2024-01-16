// Wallets
import { HDNode, mnemonic } from "thor-devkit"
import { Wallet } from "~Model"

const defaultWallet = "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

//defaultMnemonicPhrase should have VET/VTHO on test networks
export const defaultMnemonicPhrase = defaultWallet.split(" ")
export const hdnode1 = HDNode.fromMnemonic(defaultMnemonicPhrase)

export const wallet1: Wallet = {
    mnemonic: defaultMnemonicPhrase,
    rootAddress: hdnode1.address,
    nonce: "nonce",
}

export const keystoreWallet: Wallet = {
    nonce: "nonce",
    privateKey: "0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36",
    rootAddress: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
}

export const mnemonicPhrase2 = mnemonic.generate()
export const wallet2: Wallet = {
    mnemonic: mnemonicPhrase2,
    rootAddress: hdnode1.address,
    nonce: "nonce",
}

export const hdnode2 = HDNode.fromMnemonic(mnemonicPhrase2)
export const hdnode3 = HDNode.fromMnemonic(mnemonic.generate())
