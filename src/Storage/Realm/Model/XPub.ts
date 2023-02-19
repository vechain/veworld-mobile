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
