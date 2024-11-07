import { DerivationPath } from "~Constants"

export type DrivetWallet = {
    rootAddress: string
    data: string
    walletType: string
    firstAccountAddress: string
    derivationPath: DerivationPath
    salt: string
    iv: string
    creationDate: number
}
