import { createRealmContext } from "@realm/react"
import { Device, XPub, Config } from "./Model"

const SecureRealmconfig = {
    path: "secured.realm",
    deleteRealmIfMigrationNeeded:
        process.env.NODE_ENV === "development" ? true : false,
    schema: [Device, XPub],
}

const Realmconfig = {
    path: "persisted.realm",
    deleteRealmIfMigrationNeeded:
        process.env.NODE_ENV === "development" ? true : false,
    schema: [Config],
}

const inMemoryRealmconfig = {
    path: "inMemory.realm",
    inMemory: true,
    deleteRealmIfMigrationNeeded:
        process.env.NODE_ENV === "development" ? true : false,
    schema: [Device, XPub],
}

process.env.NODE_ENV === "development" &&
    console.log(
        "--- :: REALM PATH :: --- ",
        Realm.defaultPath.replace("/default.realm", ""),
    )

const {
    RealmProvider: SecureStoreProvider,
    useRealm: useSecureStore,
    useObject: useSecuredObject,
    useQuery: useSecuredQuery,
} = createRealmContext(SecureRealmconfig)

const {
    RealmProvider: StoreProvider,
    useRealm: useStore,
    useObject,
    useQuery,
} = createRealmContext(Realmconfig)

const {
    RealmProvider: CacheProvider,
    useRealm: useCache,
    useObject: useCachedObject,
    useQuery: useCachedQuery,
} = createRealmContext(inMemoryRealmconfig)

export {
    Device,
    XPub,
    Config,
    useObject,
    useQuery,
    SecureStoreProvider,
    useSecureStore,
    useSecuredObject,
    useSecuredQuery,
    StoreProvider,
    useStore,
    CacheProvider,
    useCache,
    useCachedObject,
    useCachedQuery,
}
