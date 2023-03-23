import Realm from "realm"

export class Network extends Realm.Object {
    defaultNet!: boolean
    id!: string
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
        primaryKey: "id",

        properties: {
            defaultNet: { type: "bool", default: true },
            id: { type: "string", indexed: true },
            tag: "string",
            type: "string",
            currentUrl: "string",
            urls: "string[]",
            genesisId: "string",
        },
    }
}

export const getNetworks = (store: Realm, query?: string) =>
    query
        ? store.objects<Network>(Network.getName()).filtered(query)
        : store.objects<Network>(Network.getName())
