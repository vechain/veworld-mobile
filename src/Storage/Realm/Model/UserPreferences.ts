import { Object } from "realm"

export class UserPreferences extends Object {
    _id!: string
    theme!: "dark" | "light"

    static getName(): string {
        return UserPreferences.schema.name
    }

    static getPrimaryKey(): string {
        return UserPreferences.schema.name
    }

    static schema = {
        name: "UserPreferences",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "Mnemonic" },
            theme: { type: "string", default: "light" },
        },
    }
}
