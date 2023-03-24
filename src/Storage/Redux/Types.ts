import { reducer } from "./Store"
import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore"
import { PersistPartial } from "redux-persist/es/persistReducer"

import {
    AnyAction,
    MiddlewareArray,
    ThunkMiddleware,
    ThunkDispatch,
    Dispatch,
    ThunkAction,
} from "@reduxjs/toolkit"

export type PersistedState = RootState & PersistPartial

export type Store = ToolkitStore<
    PersistedState,
    AnyAction,
    MiddlewareArray<[ThunkMiddleware<PersistedState, AnyAction>]>
>

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof reducer>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = ThunkDispatch<any, undefined, AnyAction> &
    Dispatch<AnyAction>

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AnyAction
>
