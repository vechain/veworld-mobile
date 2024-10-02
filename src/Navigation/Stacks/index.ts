export * from "./HomeStack"
export * from "./OnboardingStack"
export * from "./SwitchStack"
export * from "./SettingsStack"
export * from "./CreateWalletAppStack"
export * from "./NFTStack"
export * from "./BuyStack"
export * from "./DiscoverStack"
export * from "./HistoryStack"

import { RootStackParamListOnboarding } from "./OnboardingStack"
import { RootStackParamListHome } from "./HomeStack"
import { RootStackParamListSettings } from "./SettingsStack"
import { RootStackParamListCreateWalletApp } from "./CreateWalletAppStack"
import { RootStackParamListSwitch } from "./SwitchStack"
import { RootStackParamListNFT } from "./NFTStack"
import { RootStackParamListBuy } from "./BuyStack"
import { RootStackParamListBrowser } from "./DiscoverStack"
import { HistoryStackParamList } from "./HistoryStack"
import { RootStackParamListBackupWallet } from "~Screens/Flows/App/SecurityUpgrade_V2/Navigation.standalone"

export type ScreenRootParams = RootStackParamListSwitch &
    RootStackParamListOnboarding &
    RootStackParamListHome &
    RootStackParamListSettings &
    RootStackParamListCreateWalletApp &
    RootStackParamListNFT &
    RootStackParamListBuy &
    RootStackParamListBrowser &
    HistoryStackParamList &
    RootStackParamListBackupWallet

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ScreenRootParams {}
    }
}
