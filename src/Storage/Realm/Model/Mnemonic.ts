import { Object } from "realm"

export class Mnemonic extends Object {
    _id!: string
    mnemonic!: string

    static getName(): string {
        return Mnemonic.schema.name
    }

    static getPrimaryKey(): string {
        return Mnemonic.schema.name
    }

    static schema = {
        name: "Mnemonic",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "Mnemonic" },
            mnemonic: { type: "string", default: "" },
        },
    }
}

export const getMnemonic = (cache: Realm) =>
    cache.objectForPrimaryKey<Mnemonic>(
        Mnemonic.getName(),
        Mnemonic.getPrimaryKey(),
    )
