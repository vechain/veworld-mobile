import { useEffect, useState } from "react"
import { configureStore } from "@reduxjs/toolkit"
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    Persistor,
} from "redux-persist"

import { storage } from "./Storage"
import { encryptTransform, initEncryption } from "./EncryptionService"
import { reducer } from "./Store"
import { RootState, Store } from "./Types"

export const useInitStore = () => {
    const [store, setStore] = useState<Store | undefined>()
    const [persistor, setPersistor] = useState<Persistor | undefined>()

    useEffect(() => {
        async function init() {
            const key = await initEncryption()

            const encryptor = encryptTransform({
                secretKey: key,
                onError: function (error) {
                    console.warn(error)
                },
            })

            const persistConfig = {
                key: "root",
                storage,
                version: 1,
                blacklist: [],
                whitelist: ["userPreferences"],
                transforms: [encryptor],
            }

            const persistedReducer = persistReducer<RootState>(
                persistConfig,
                reducer,
            )

            const _store = configureStore({
                reducer: persistedReducer,
                middleware: getDefaultMiddleware =>
                    getDefaultMiddleware({
                        serializableCheck: {
                            ignoredActions: [
                                FLUSH,
                                REHYDRATE,
                                PAUSE,
                                PERSIST,
                                PURGE,
                                REGISTER,
                            ],
                        },
                    }),
                devTools: process.env.NODE_ENV !== "production",
            })

            const _persistor = persistStore(_store)

            setStore(_store)
            setPersistor(_persistor)
        }

        init()
    }, [])

    return [store, persistor]
}
