import { combineReducers } from "redux"
import {
    DeviceSlice,
    UserPreferencesSlice,
    ConfigSlice,
    AccountSlice,
    MnemonicSlice,
} from "./Slices"

export const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
    config: ConfigSlice.reducer,
    devices: DeviceSlice.reducer,
    accounts: AccountSlice.reducer,
    mnemonic: MnemonicSlice.reducer,
})
