export * from "./HomeStack"
export * from "./OnboardingStack"
export * from "./SwitchStack"
export * from "./SettingsStack"
export * from "./CreateWalletAppStack"
export * from "./BuyStack"
export * from "./HistoryStack"
export * from "./AppsStack"

import { RootStackParamListOnboarding } from "./OnboardingStack"
import { RootStackParamListHome } from "./HomeStack"
import { RootStackParamListSettings } from "./SettingsStack"
import { RootStackParamListCreateWalletApp } from "./CreateWalletAppStack"
import { RootStackParamListSwitch } from "./SwitchStack"
import { RootStackParamListBuy } from "./BuyStack"
import { HistoryStackParamList } from "./HistoryStack"
import { RootStackParamListBackupWallet } from "~Screens/Flows/App/SecurityUpgrade_V2/Navigation.standalone"
import { RootStackParamListApps } from "./AppsStack"
import { TabStackParamList } from "~Navigation/Tabs"

export type ScreenRootParams = RootStackParamListSwitch &
    RootStackParamListOnboarding &
    RootStackParamListHome &
    RootStackParamListSettings &
    RootStackParamListCreateWalletApp &
    RootStackParamListBuy &
    HistoryStackParamList &
    RootStackParamListBackupWallet &
    RootStackParamListApps &
    TabStackParamList

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ScreenRootParams {}
    }
}
