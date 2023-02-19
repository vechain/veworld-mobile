import { Object } from "realm"

export class Account extends Object {
    address!: string
    index!: number
    visible!: boolean
    alias!: string
    createdAt!: string

    static getName(): string {
        return Account.schema.name
    }

    static PrimaryKey(): string {
        return Account.schema.primaryKey
    }

    static schema = {
        name: "Account",
        primaryKey: "address",

        properties: {
            address: { type: "string", indexed: true },
            index: "int",
            visible: "bool",
            parent: {
                type: "linkingObjects",
                objectType: "Device",
                property: "accounts",
            },
            alias: "string",
            createdAt: {
                type: "string",
                indexed: true,
                default: new Date().toISOString(),
            },
        },
    }
}
