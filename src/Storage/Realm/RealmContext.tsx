import "react-native-get-random-values" // relma dependency for uuid - DO NOT REMOVE
import Realm from "realm"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
    Device,
    XPub,
    Config,
    Mnemonic,
    Account,
    AppLock,
    UserPreferences,
    Network,
    getAppLock,
    getMnemonic,
    getNetworks,
    getConfig,
    getUserPreferences,
} from "./Model"
import KeychainService from "~Services/KeychainService"
import { NETWORK_TYPE, WALLET_STATUS } from "~Model"
import crypto from "react-native-quick-crypto"
import { ColorSchemeName } from "react-native"
import { ThorConstants, useColorScheme } from "~Common"

type State = {
    store: Realm
    cache: Realm
}

type RealmContextProviderProps = { children: React.ReactNode }

const RealmContext = React.createContext<State | undefined>(undefined)

const RealmContextProvider = ({ children }: RealmContextProviderProps) => {
    const colorScheme = useColorScheme()

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
            initRealmClasses(cacheInstance, storeInstance, colorScheme)
            setStore(storeInstance)
            setCache(cacheInstance)
        }
    }, [colorScheme])

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
        schema: [Device, XPub, Config, Account, UserPreferences, Network],
        path: "persisted.realm",
        encryptionKey: buffKey,
        deleteRealmIfMigrationNeeded:
            process.env.NODE_ENV === "development" ? true : false,
    })
    return instance
}

const initCacheRealm = () => {
    const instance = new Realm({
        schema: [Mnemonic, AppLock],
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

export const initRealmClasses = (
    cache: Realm,
    store: Realm,
    colorScheme: NonNullable<ColorSchemeName>,
) => {
    // [ START ] - CACHE
    cache.write(() => {
        const appLock = getAppLock(cache)
        if (!appLock)
            cache.create(AppLock.getName(), { status: WALLET_STATUS.LOCKED })

        const mnemonic = getMnemonic(cache)
        if (!mnemonic) cache.create(Mnemonic.getName(), {})
    })
    // [ END ] - CACHE

    // [ START ] - STORE
    store.write(() => {
        const networks = getNetworks(store)
        if (networks.length === 0) {
            store.create(Network.getName(), {
                ...ThorConstants.makeNetwork(NETWORK_TYPE.MAIN),
            })
            store.create(Network.getName(), {
                ...ThorConstants.makeNetwork(NETWORK_TYPE.TEST),
            })
        }

        const config = getConfig(store)
        if (!config) {
            store.create(Config.getName(), {})
        }

        const userPreferences = getUserPreferences(store)

        if (!userPreferences) {
            store.create(UserPreferences.getName(), {
                isAppLockActive: process.env.NODE_ENV !== "development",
                theme: colorScheme,
                currentNetwork: networks[0], // main network is default
            })
        } else {
            userPreferences.theme = colorScheme
        }
    })
    // [ END ] - STORE
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
