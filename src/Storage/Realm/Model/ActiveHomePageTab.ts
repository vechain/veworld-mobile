import { Object } from "realm"

export class ActiveHomePageTab extends Object {
    _id!: string
    activeIndex!: number

    static getName(): string {
        return ActiveHomePageTab.schema.name
    }

    static getPrimaryKey(): string {
        return ActiveHomePageTab.schema.name
    }

    static schema = {
        name: "ActiveHomePageTab",
        primaryKey: "_id",

        properties: {
            _id: { type: "string", default: "ActiveHomePageTab" },
            activeIndex: { type: "int", default: 0 },
        },
    }
}
