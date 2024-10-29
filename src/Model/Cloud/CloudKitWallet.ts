import { DerivationPath } from "~Constants"

export type CloudKitWallet = {
    data: string
    rootAddress: string
    walletType: string
    salt: string
    firstAccountAddress: string
    creationDate: number
    derivationPath: DerivationPath
}
