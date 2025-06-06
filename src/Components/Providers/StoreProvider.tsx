import React, { useCallback, useEffect, useRef, useState } from "react"
import { getPersistorConfig, newStorage, NftSlice, NftSliceState, reducer } from "~Storage/Redux"
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
import { PersistedCacheProvider, useApplicationSecurity } from "~Components/Providers"
import { Reducer } from "redux"
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
        const persistConfig: PersistConfig<RootState> = await getPersistorConfig(mmkv, encryptionKey)

        const nftPersistence: PersistConfig<NftSliceState> = {
            key: NftSlice.name,
            storage: newStorage(mmkv),
            whitelist: ["blackListedCollections", "reportedCollections"],
        }

        const persistedReducer: Reducer = persistReducer<RootState>(persistConfig, reducer(nftPersistence))

        if (store.current) {
            store.current.replaceReducer(persistedReducer)
        } else {
            store.current = configureStore({
                reducer: persistedReducer,
                middleware: getDefaultMiddleware =>
                    getDefaultMiddleware({
                        immutableCheck: {
                            // fix for repeated warnings "ImmutableStateInvariantMiddleware took 34ms, which is more than the warning threshold of <xx>ms"
                            warnAfter: 100, // Custom threshold
                        },
                        serializableCheck: {
                            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                        },
                        thunk: {
                            extraArgument: {},
                        },
                    }),
                enhancers: [reduxReset()],
                devTools: process.env.NODE_ENV !== "production",
            })
        }

        const _persistor = persistStore(store.current)
        setPersistor(_persistor)
    }, [])

    useEffect(() => {
        reduxStorage && initStore(reduxStorage.mmkv, reduxStorage.encryptionKey)
    }, [initStore, reduxStorage])

    if (!store.current || !persistor) {
        return <></>
    }

    return (
        <SplashScreen>
            <StoreContext.Provider value={undefined}>
                <Provider store={store.current}>
                    <PersistGate loading={null} persistor={persistor}>
                        <PersistedCacheProvider>{children}</PersistedCacheProvider>
                    </PersistGate>
                </Provider>
            </StoreContext.Provider>
        </SplashScreen>
    )
}

export { StoreContextProvider }
