import React, { useState, useEffect, useMemo, useCallback } from "react"
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
import KeychainService from "~Services/KeychainService"
import { WALLET_STATUS } from "~Model"
import crypto from "react-native-quick-crypto"

type State = {
    store: Realm
    cache: Realm
}

type RealmContextProviderProps = { children: React.ReactNode }

const RealmContext = React.createContext<State | undefined>(undefined)

const RealmContextProvider = ({ children }: RealmContextProviderProps) => {
    const [store, setStore] = useState<Realm>()
    const [cache, setCache] = useState<Realm>()

    const value = useMemo(
        () => (store && cache ? { store, cache } : undefined),
        [cache, store],
    )

    const initRealm = useCallback(async () => {
        const encKey = await KeychainService.getRealmKey()
        let _isKey: boolean = false
        let _buffKey: ArrayBuffer

        if (encKey) {
            const { keyBuff, isKey } = getKey(encKey)
            _buffKey = keyBuff
            _isKey = isKey
        } else {
            const { keyBuff, isKey } = await createKey()
            _buffKey = keyBuff
            _isKey = isKey
        }

        if (_isKey && _buffKey) {
            const cacheInstance = initCacheRealm()
            const storeInstance = initStoreRealm(_buffKey)
            initRealmClasses(cacheInstance, storeInstance)
            setStore(storeInstance)
            setCache(cacheInstance)
        }
    }, [])

    useEffect(() => {
        initRealm()
    }, [initRealm])

    if (!value) {
        return <></>
    }

    return (
        <RealmContext.Provider value={value}>{children}</RealmContext.Provider>
    )
}

const initStoreRealm = (buffKey: ArrayBuffer) => {
    const instance = new Realm({
        schema: [Device, XPub, Config, Account],
        path: "persisted.realm",
        encryptionKey: buffKey,
        deleteRealmIfMigrationNeeded:
            process.env.NODE_ENV === "development" ? true : false,
    })
    return instance
}

const initCacheRealm = () => {
    const instance = new Realm({
        schema: [Biometrics, Mnemonic, ActiveWalletCard, AppLock],
        path: "inMemory.realm",
        inMemory: true,
        deleteRealmIfMigrationNeeded:
            process.env.NODE_ENV === "development" ? true : false,
    })

    return instance
}

const useRealm = () => {
    const context = React.useContext(RealmContext)
    if (!context) {
        throw new Error(
            "useRealmContext must be used within a UserContextProvider",
        )
    }

    return context
}

const initRealmClasses = (cache: Realm, store: Realm) => {
    cache.write(() => {
        cache.create(AppLock.getName(), { status: WALLET_STATUS.LOCKED })
        cache.create(ActiveWalletCard.getName(), {})
        cache.create(Mnemonic.getName(), {})
    })

    let config = store.objectForPrimaryKey<Config>(
        Config.getName(),
        Config.PrimaryKey(),
    )

    if (!config) {
        store.write(() => {
            store.create(Config.getName(), {})
        })
    }
}

const getKey = (encKey: string) => {
    const key64 = Buffer.from(encKey, "base64")
    const keyToArr = new Uint8Array(key64)

    process.env.NODE_ENV === "development" &&
        console.log("Realm Encryption key : ", key64.toString("hex"))

    return { keyBuff: keyToArr, isKey: true }
}

const createKey = async () => {
    const arr = new Uint8Array(64)
    const keyBuff = crypto.getRandomValues(arr) as ArrayBuffer
    const key64: string = Buffer.from(keyBuff).toString("base64")
    await KeychainService.setRealmKey(key64)

    return { keyBuff, isKey: true }
}

export { RealmContextProvider, useRealm }

process.env.NODE_ENV === "development" &&
    console.log(
        "--- :: REALM PATH :: --- ",
        Realm.defaultPath.replace("/default.realm", ""),
    )
