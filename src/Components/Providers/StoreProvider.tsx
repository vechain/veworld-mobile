import { configureStore, MiddlewareArray, ThunkMiddleware } from "@reduxjs/toolkit"
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { MMKV } from "react-native-mmkv"
import { Provider } from "react-redux"
import { AnyAction, Reducer } from "redux"
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
import { PersistConfig } from "redux-persist/es/types"
import { PersistGate } from "redux-persist/integration/react"
import reduxReset from "redux-reset"
import { PersistedCacheProvider, useApplicationSecurity } from "~Components/Providers"
import { getPersistorConfig, newStorage, NftSlice, NftSliceState, reducer } from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"
import { SplashScreen } from "../../../src/SplashScreen"

type StoreContextType = {
    store:
        | ReturnType<
              typeof configureStore<RootState, AnyAction, MiddlewareArray<[ThunkMiddleware<any, AnyAction, {}>]>, any[]>
          >
        | undefined
}

const StoreContext = React.createContext<StoreContextType | undefined>(undefined)

type StoreContextProviderProps = { children: React.ReactNode }

const StoreContextProvider = ({ children }: StoreContextProviderProps) => {
    const { redux: reduxStorage } = useApplicationSecurity()

    const store =
        useRef<
            ReturnType<
                typeof configureStore<
                    RootState,
                    AnyAction,
                    MiddlewareArray<[ThunkMiddleware<any, AnyAction, {}>]>,
                    any[]
                >
            >
        >()

    //Store that is reactive when the app goes back to the foreground
    const [reactiveStore, setReactiveStore] =
        useState<
            ReturnType<
                typeof configureStore<
                    RootState,
                    AnyAction,
                    MiddlewareArray<[ThunkMiddleware<any, AnyAction, {}>]>,
                    any[]
                >
            >
        >()

    const [persistor, setPersistor] = useState<Persistor | undefined>()

    const initStore = useCallback(async (mmkv: MMKV, encryptionKey: string) => {
        const persistConfig: PersistConfig<RootState> = await getPersistorConfig(mmkv, encryptionKey)

        const nftPersistence: PersistConfig<NftSliceState> = {
            key: NftSlice.name,
            storage: newStorage(mmkv),
            whitelist: ["blackListedCollections", "reportedCollections", "favoriteNfts"],
        }

        const persistedReducer: Reducer = persistReducer<RootState>(persistConfig, reducer(nftPersistence))

        if (store.current) {
            store.current.replaceReducer(persistedReducer)
            setReactiveStore(store.current)
        } else {
            store.current = configureStore<
                RootState,
                AnyAction,
                MiddlewareArray<[ThunkMiddleware<any, AnyAction, {}>]>,
                any[]
            >({
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
            setReactiveStore(store.current)
        }

        const _persistor = persistStore(store.current)
        setPersistor(_persistor)
    }, [])

    useEffect(() => {
        reduxStorage && initStore(reduxStorage.mmkv, reduxStorage.encryptionKey)
    }, [initStore, reduxStorage])

    const contextValue = useMemo(() => ({ store: reactiveStore }), [reactiveStore])

    if (!store.current || !persistor) {
        return <></>
    }

    return (
        <SplashScreen>
            <StoreContext.Provider value={contextValue}>
                <Provider store={store.current}>
                    <PersistGate loading={null} persistor={persistor}>
                        <PersistedCacheProvider>{children}</PersistedCacheProvider>
                    </PersistGate>
                </Provider>
            </StoreContext.Provider>
        </SplashScreen>
    )
}

const useStore = () => {
    const context = useContext(StoreContext)
    if (!context) {
        throw new Error("useStore must be used within a StoreContextProvider")
    }
    return context
}

export { StoreContextProvider, useStore }
