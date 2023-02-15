/* eslint-disable @typescript-eslint/no-shadow */
import { createRealmContext } from "@realm/react"
import {
    Device,
    XPub,
    Config,
    Biometrics,
    Mnemonic,
    Account,
    ActiveWalletCard,
    AppLock,
} from "./Model"

const Realmconfig = {
    path: "persisted.realm",
    deleteRealmIfMigrationNeeded:
        process.env.NODE_ENV === "development" ? true : false,
    schema: [Device, XPub, Config, Account],
}

const inMemoryRealmconfig = {
    path: "inMemory.realm",
    inMemory: true,
    deleteRealmIfMigrationNeeded:
        process.env.NODE_ENV === "development" ? true : false,
    schema: [Biometrics, Mnemonic, ActiveWalletCard, AppLock],
}

process.env.NODE_ENV === "development" &&
    console.log(
        "--- :: REALM PATH :: --- ",
        Realm.defaultPath.replace("/default.realm", ""),
    )

const {
    RealmProvider: StoreProvider,
    useRealm: useStore,
    useObject: useStoreObject,
    useQuery: useStoreQuery,
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
    Biometrics,
    Mnemonic,
    Account,
    ActiveWalletCard,
    AppLock,
    useStoreObject,
    useStoreQuery,
    StoreProvider,
    useStore,
    CacheProvider,
    useCache,
    useCachedObject,
    useCachedQuery,
}

export enum RealmClass {
    Device = "Device",
    XPub = "XPub",
    Config = "Config",
    Biometrics = "Biometrics",
    AppState = "AppState",
    Mnemonic = "Mnemonic",
    Account = "Account",
    ActiveWalletCard = "ActiveWalletCard",
    AppLock = "AppLock",
}
