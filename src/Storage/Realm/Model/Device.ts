import { index, Object } from "realm"
import { Account } from "./Account"
import { XPub } from "./XPub"

// Supported types
// https://www.mongodb.com/docs/realm/sdk/react-native/realm-database/schemas/field-types/
// example: // Realm.Types.Int = 0;

// / Specify that the name and description fields are required when creating an instance with `new`
export class Device extends Object<Device, "rootAddress"> {
    @index // index devices with address
    rootAddress!: string
    xPub?: XPub
    type!: string
    alias!: string
    wallet!: string
    accounts?: Account[]

    static primaryKey = "rootAddress"
}
