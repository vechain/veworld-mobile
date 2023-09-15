import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    getPersistorConfig,
    newStorage,
    NftSlice,
    NftSliceState,
    reducer,
} from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"
import {
    FLUSH,
    PAUSE,
    PERSIST,
    Persistor,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from "redux-persist"
import reduxReset from "redux-reset"
import { configureStore } from "@reduxjs/toolkit"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import {
    PersistedCacheProvider,
    useApplicationSecurity,
} from "~Components/Providers"
import { Reducer } from "redux"
import { warn } from "~Utils"
import { MMKV } from "react-native-mmkv"
import { SplashScreen } from "../../../src/SplashScreen"
import { PersistConfig } from "redux-persist/es/types"

const StoreContext = React.createContext<undefined>(undefined)

type StoreContextProviderProps = { children: React.ReactNode }

const StoreContextProvider = ({ children }: StoreContextProviderProps) => {
    const { redux: reduxStorage } = useApplicationSecurity()

    const store = useRef<ReturnType<typeof configureStore>>()

    const [persistor, setPersistor] = useState<Persistor | undefined>()

    const initStore = useCallback(async (mmkv: MMKV, encryptionKey: string) => {
        const persistConfig: PersistConfig<RootState> =
            await getPersistorConfig(mmkv, encryptionKey)

        const nftPersistence: PersistConfig<NftSliceState> = {
            key: NftSlice.name,
            storage: newStorage(mmkv),
            whitelist: ["blackListedCollections"],
        }

        const persistedReducer: Reducer = persistReducer<RootState>(
            persistConfig,
            reducer(nftPersistence),
        )

        if (store.current) {
            warn("Replacing store")
            store.current.replaceReducer(persistedReducer)
        } else {
            let middlewares: any[] = []
            if (process.env.NODE_ENV !== "production") {
                const createDebugger = require("redux-flipper").default
                middlewares.push(createDebugger())
            }

            store.current = configureStore({
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
        }

        const _persistor = persistStore(store.current)
        setPersistor(_persistor)
    }, [])

    useEffect(() => {
        if (reduxStorage)
            initStore(reduxStorage.mmkv, reduxStorage.encryptionKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reduxStorage])

    if (!store.current || !persistor) {
        return <></>
    }

    return (
        <SplashScreen>
            <StoreContext.Provider value={undefined}>
                <Provider store={store.current}>
                    <PersistGate loading={null} persistor={persistor}>
                        <PersistedCacheProvider>
                            {children}
                        </PersistedCacheProvider>
                    </PersistGate>
                </Provider>
            </StoreContext.Provider>
        </SplashScreen>
    )
}

export { StoreContextProvider }
