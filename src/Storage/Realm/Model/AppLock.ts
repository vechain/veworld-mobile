import { Object } from "realm"

export class AppLock extends Object {
    _id!: string
    status!: string

    static getName(): string {
        return AppLock.schema.name
    }

    static PrimaryKey(): string {
        return AppLock.schema.primaryKey
    }

    static schema = {
        name: "AppLock",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "APP_LOCK" },
            status: "string",
        },
    }
}
