import { Object } from "realm"

export class SelectedAccount extends Object {
    _id!: string
    address?: string

    static getName(): string {
        return SelectedAccount.schema.name
    }

    static getPrimaryKey(): string {
        return SelectedAccount.schema.name
    }

    static schema = {
        name: "SelectedAccount",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "SelectedAccount" },
            address: "string?",
        },
    }
}
