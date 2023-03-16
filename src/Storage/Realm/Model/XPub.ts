import { Object } from "realm"

export class XPub extends Object {
    publicKey!: string
    chainCode!: string

    static getName(): string {
        return XPub.schema.name
    }

    static schema = {
        name: "XPub",

        properties: {
            publicKey: "string",
            chainCode: "string",
        },
    }
}

export const getXPub = (store: Realm, query?: string) =>
    query
        ? store.objects<XPub>(XPub.getName()).filtered(query)
        : store.objects<XPub>(XPub.getName())
