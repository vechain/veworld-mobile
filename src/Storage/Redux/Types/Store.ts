import { reducer } from "../Store"
import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore"
import { PersistPartial } from "redux-persist/es/persistReducer"

import {
    AnyAction,
    createAsyncThunk,
    MiddlewareArray,
    ThunkAction,
    ThunkDispatch,
} from "@reduxjs/toolkit"

export type PersistedState = RootState & PersistPartial

export type Store = ToolkitStore<
    PersistedState,
    AnyAction,
    MiddlewareArray<any>
>

// 1. Get the root state's type from reducers
export type RootState = ReturnType<typeof reducer>

// 2. Create a type for thunk dispatch
export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AnyAction
>

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
    state: RootState
    dispatch: AppThunkDispatch
    rejectValue: string
    extra: { s: string; n: number }
}>()
