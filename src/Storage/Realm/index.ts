/* eslint-disable @typescript-eslint/no-shadow */
import { createRealmContext } from "@realm/react"
import {
    Device,
    XPub,
    Config,
    AppState,
    Biometrics,
    Mnemonic,
    Account,
    ActiveWalletCard,
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
    schema: [AppState, Biometrics, Mnemonic, ActiveWalletCard],
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
    AppState,
    Mnemonic,
    Account,
    ActiveWalletCard,
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
}
