import { Object } from "realm"

export class ActiveWalletCard extends Object {
    _id!: string
    activeIndex!: number

    static getName(): string {
        return ActiveWalletCard.schema.name
    }

    static PrimaryKey(): string {
        return ActiveWalletCard.schema.name
    }

    static schema = {
        name: "ActiveWalletCard",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "ActiveWalletCard" },
            activeIndex: { type: "int", default: 0 },
        },
    }
}
