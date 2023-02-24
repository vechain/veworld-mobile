import { Object } from "realm"

export class AppLock extends Object {
    _id!: string
    status!: string

    static getName(): string {
        return AppLock.schema.name
    }

    static getPrimaryKey(): string {
        return AppLock.schema.name
    }

    static schema = {
        name: "AppLock",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "AppLock" },
            status: "string",
        },
    }
}
