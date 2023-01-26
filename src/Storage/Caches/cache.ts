import {
    Action,
    AnyAction,
    combineReducers,
    configureStore,
    Reducer,
    ThunkDispatch,
} from "@reduxjs/toolkit"
import { appStateSlice, initialAppState } from "./AppStateCache"
import { initialWalletState, walletStateSlice } from "./LocalWalletCache"
import { biometricsSlice, initialBiometricsState } from "./BiometricsCache"

const combinedReducer = combineReducers({
    appState: appStateSlice.reducer,
    walletState: walletStateSlice.reducer,
    biometricsState: biometricsSlice.reducer,
})

export type RootState = ReturnType<typeof combinedReducer>

export const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
    if (action.type === "wallet/clearEntireCache") {
        state = {
            appState: initialAppState,
            walletState: initialWalletState,
            biometricsState: initialBiometricsState,
        }
    }
    return combinedReducer(state, action)
}

export const store = configureStore({
    reducer: rootReducer,
})

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch

export type GenericThunkAction<
    TReturnType,
    TState,
    TExtraThunkArg,
    TBasicAction extends Action,
> = (
    dispatch: ThunkDispatch<TState, TExtraThunkArg, TBasicAction>,
    getState: () => TState,
    extraArgument: TExtraThunkArg,
) => TReturnType

//Use this when your Thunk is async and has a return type
export type AppThunk<TReturnType> = GenericThunkAction<
    TReturnType,
    RootState,
    unknown,
    Action
>
