import { combineReducers } from "redux"
import {
    DeviceSlice,
    UserPreferencesSlice,
    ConfigSlice,
    AccountSlice,
    MnemonicSlice,
    TokenSlice,
    BalanceSlice,
} from "./Slices"

export const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
    config: ConfigSlice.reducer,
    devices: DeviceSlice.reducer,
    accounts: AccountSlice.reducer,
    mnemonic: MnemonicSlice.reducer,
    tokens: TokenSlice.reducer,
    balances: BalanceSlice.reducer,
})
