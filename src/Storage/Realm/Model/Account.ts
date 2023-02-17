import { index, Object } from "realm"

export class Account extends Object<Account> {
    @index
    address!: string

    id!: number
    index!: number
    visible!: boolean
    alias!: string

    parent!: Realm.Types.LinkingObjects<Account, "Device">

    static primaryKey = "address"
}
