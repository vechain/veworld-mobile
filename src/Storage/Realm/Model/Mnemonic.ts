import { Object } from "realm"

export class Mnemonic extends Object<Mnemonic> {
    _id = "WALLET_MNEMONIC"
    mnemonic = ""

    static primaryKey = "_id"
    name = "Mnemonic"
}
