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
import reduxReset from "redux-reset"

import { reducer } from "./Store"
import { RootState, Store } from "./Types"
import { getPersistorConfig } from "./Helpers"

export const useInitStore = () => {
    const [store, setStore] = useState<Store | undefined>()
    const [persistor, setPersistor] = useState<Persistor | undefined>()

    useEffect(() => {
        async function init() {
            const persistConfig = await getPersistorConfig()

            const persistedReducer = persistReducer<RootState>(
                persistConfig,
                reducer,
            )

            let createDebugger: any
            if (__DEV__) {
                createDebugger = require("redux-flipper").default
            }

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
                    }).concat(createDebugger()),
                enhancers: [reduxReset()],
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
