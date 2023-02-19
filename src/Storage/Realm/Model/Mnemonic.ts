import { Object } from "realm"

export class Mnemonic extends Object {
    _id!: string
    mnemonic!: string

    static getName(): string {
        return Mnemonic.schema.name
    }

    static PrimaryKey(): string {
        return Mnemonic.schema.primaryKey
    }

    static schema = {
        name: "Mnemonic",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "WALLET_MNEMONIC" },
            mnemonic: { type: "string", default: "" },
        },
    }
}
