import { Object } from "realm"

export class Network extends Object {
    defaultNet!: boolean
    nodeId!: Realm.BSON.ObjectId
    tag!: string
    type!: string
    urls!: string[]
    currentUrl!: string
    genesisId!: string

    static getName(): string {
        return Network.schema.name
    }

    static getPrimaryKey(): string {
        return Network.schema.primaryKey
    }

    static schema = {
        name: "Network",
        primaryKey: "nodeId",

        properties: {
            defaultNet: { type: "bool", default: true },
            nodeId: {
                type: "objectId",
                default: () => new Realm.BSON.ObjectId(),
                indexed: true,
            },
            tag: "string",
            type: "string",
            currentUrl: "string",
            urls: "string[]",
            genesisId: "string",
        },
    }
}
