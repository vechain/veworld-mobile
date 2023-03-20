import { Object } from "realm"

export class ScannedAddress extends Object {
    _id!: string
    address!: string
    isShowSend!: boolean

    static getName(): string {
        return ScannedAddress.schema.name
    }

    static getPrimaryKey(): string {
        return ScannedAddress.schema.name
    }

    static schema = {
        name: "ScannedAddress",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "ScannedAddress" },
            address: { type: "string", default: "" },
            isShowSend: { type: "bool", default: false },
        },
    }
}

export const getScannedAddress = (cache: Realm) =>
    cache.objectForPrimaryKey<ScannedAddress>(
        ScannedAddress.getName(),
        ScannedAddress.getPrimaryKey(),
    ) as ScannedAddress
