import {
    Action,
    AnyAction,
    combineReducers,
    configureStore,
    Reducer,
    ThunkDispatch,
} from "@reduxjs/toolkit"
import { accountSlice, initialAccountState } from "./AccountCache"
import { initialWalletAccessState, walletAccessSlice } from "./WalletAccess"
import { settingSlice } from "./SettingsCache"
import { balanceSlice, initialBalanceState } from "./BalanceCache"
import { initialTokenState, tokenSlice } from "./TokenCache"
import { activitySlice, initialActivityState } from "./ActivityCache"
import { currencySlice, initialCurrencyState } from "./CurrencyCache"
import { deviceSlice, initialDeviceState } from "./DeviceCache"
import {
    connectedAppSlice,
    initialConnectedAppsState,
} from "./ConnectedAppCache"
import { initialOnboardState, onboardSlice } from "./OnboardCache"
import { SettingsConstants } from "~Common"

const combinedReducer = combineReducers({
    account: accountSlice.reducer,
    walletAccess: walletAccessSlice.reducer,
    settings: settingSlice.reducer,
    tokens: tokenSlice.reducer,
    balances: balanceSlice.reducer,
    activities: activitySlice.reducer,
    currency: currencySlice.reducer,
    devices: deviceSlice.reducer,
    connectedApps: connectedAppSlice.reducer,
    onboard: onboardSlice.reducer,
})

export type RootState = ReturnType<typeof combinedReducer>

export const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
    if (action.type === "wallet/clearEntireCache") {
        state = {
            account: initialAccountState,
            walletAccess: initialWalletAccessState,
            settings: SettingsConstants.getDefaultSettings(),
            tokens: initialTokenState,
            balances: initialBalanceState,
            activities: initialActivityState,
            currency: initialCurrencyState,
            devices: initialDeviceState,
            connectedApps: initialConnectedAppsState,
            onboard: initialOnboardState,
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
