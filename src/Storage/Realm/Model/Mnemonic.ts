import { Object } from "realm"

export class Mnemonic extends Object<Mnemonic> {
    _id = "WALLET_MNEMONIC"
    mnemonic?: string

    static primaryKey = "_id"
}
