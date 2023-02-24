import { Account } from "./Account"
import { XPub } from "./XPub"
import { Object } from "realm"

export class Device extends Object {
    type!: string
    alias!: string
    wallet!: string
    index!: number
    rootAddress!: string
    accounts!: Account[]
    createdAt?: string
    xPub?: XPub

    static getName(): string {
        return Device.schema.name
    }

    static getPrimaryKey(): string {
        return Device.schema.primaryKey
    }

    static schema = {
        name: "Device",
        primaryKey: "rootAddress",

        properties: {
            type: "string",
            alias: "string",
            rootAddress: "string",
            wallet: "string",
            index: { type: "int", indexed: true },
            xPub: "XPub?",
            createdAt: {
                type: "string",
                indexed: true,
                default: new Date().toISOString(),
            },
            accounts: "Account[]",
        },
    }
}
