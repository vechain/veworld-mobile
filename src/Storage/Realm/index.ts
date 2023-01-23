import { createRealmContext } from "@realm/react"
import { Device, XPub } from "./Model"

const config = {
    path: "persisted.realm",
    deleteRealmIfMigrationNeeded:
        process.env.NODE_ENV === "development" ? true : false,
    schema: [Device, XPub],
}

process.env.NODE_ENV === "development" &&
    console.log(
        "--- :: REALM PATH :: --- ",
        Realm.defaultPath.replace("/default.realm", ""),
    )

const { RealmProvider, useRealm, useObject, useQuery } =
    createRealmContext(config)

export { Device, XPub, RealmProvider, useRealm, useObject, useQuery }
