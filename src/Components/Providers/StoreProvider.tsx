import React, { useState, useEffect, useCallback, useMemo } from "react"
import { getPersistorConfig, reducer } from "~Storage/Redux"
import { RootState, Store } from "~Storage/Redux/Types"
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
import { configureStore } from "@reduxjs/toolkit"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

type StoreProvider = {
    store: Store
    persistor: Persistor
    init: () => Promise<void>
}

const StoreContext = React.createContext<StoreProvider | undefined>(undefined)

type StoreContextProviderProps = { children: React.ReactNode }

const StoreContextProvider = ({ children }: StoreContextProviderProps) => {
    const [store, setStore] = useState<Store | undefined>()
    const [persistor, setPersistor] = useState<Persistor | undefined>()

    const init = useCallback(async () => {
        const persistConfig = await getPersistorConfig()

        const persistedReducer = persistReducer<RootState>(
            persistConfig,
            reducer,
        )

        let middlewares: any[] = []
        if (process.env.NODE_ENV !== "production") {
            const createDebugger = require("redux-flipper").default
            middlewares.push(createDebugger())
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
                    thunk: {
                        extraArgument: {},
                    },
                }).concat(middlewares),
            enhancers: [reduxReset()],
            devTools: process.env.NODE_ENV !== "production",
        })

        const _persistor = persistStore(_store)

        setStore(_store)
        setPersistor(_persistor)
    }, [])

    const value = useMemo(() => {
        if (store && persistor)
            return {
                store,
                persistor,
                init,
            }

        return undefined
    }, [init, persistor, store])

    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!value) {
        return <></>
    }

    return (
        <StoreContext.Provider value={value}>
            <Provider store={value.store}>
                <PersistGate loading={null} persistor={value.persistor}>
                    {children}
                </PersistGate>
            </Provider>
        </StoreContext.Provider>
    )
}

const useInitStore = () => {
    const context = React.useContext(StoreContext)
    if (!context) {
        throw new Error(
            "useInitStore must be used within a StoreContextProvider",
        )
    }

    return context
}

export { StoreContextProvider, useInitStore }
