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
} from "redux-persist"

import { combineReducers } from "redux"
import { storage } from "./Storage"
import { UserPreferencesSlice } from "./Slices"
import { encryptTransform } from "./EncryptionService"

const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
})

const encryptor = encryptTransform({
    secretKey: "initEncryption",
    onError: function (error: Error) {
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

const persistedReducer = persistReducer(persistConfig, reducer)

export const store = configureStore({
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

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
