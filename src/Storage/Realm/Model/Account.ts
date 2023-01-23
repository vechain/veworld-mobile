import { index, Object } from "realm"

export class Account extends Object<Account, "rootAddress"> {
    @index
    rootAddress!: string

    id!: number
    index!: number
    visible!: boolean
    alias!: string
    address!: string

    static primaryKey = "rootAddress"
}
