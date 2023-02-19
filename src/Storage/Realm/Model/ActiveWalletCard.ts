import { Object } from "realm"

export class ActiveWalletCard extends Object {
    _id!: string
    isLoading!: boolean
    activeIndex!: number

    static getName(): string {
        return ActiveWalletCard.schema.name
    }

    static PrimaryKey(): string {
        return ActiveWalletCard.schema.primaryKey
    }

    static schema = {
        name: "ActiveWalletCard",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "ACTIVE_WALLET_CARD" },
            activeIndex: { type: "int", default: 0 },
            isLoading: { type: "bool", default: false },
        },
    }
}
