import { DerivationPath } from "~Constants"

export type DriveWallet = {
    rootAddress: string
    data: string
    walletType: string
    firstAccountAddress: string
    derivationPath: DerivationPath
    salt: string
    iv: string
    creationDate: number
}
