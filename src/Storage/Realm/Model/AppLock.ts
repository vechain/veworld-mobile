import { Object } from "realm"

export class AppLock extends Object<AppLock> {
    _id = "APP_LOCK"
    status = "LOCKED"

    static primaryKey = "_id"

    constructor(realm: Realm, status: string) {
        super(realm, {
            status,
        })
    }
}
