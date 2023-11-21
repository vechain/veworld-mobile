export * from "./HomeStack"
export * from "./OnboardingStack"
export * from "./SwitchStack"
export * from "./SettingsStack"
export * from "./CreateWalletAppStack"
export * from "./DiscoverStack"
export * from "./NFTStack"
export * from "./BuyStack"
export * from "./BrowserStack"

import { RootStackParamListOnboarding } from "./OnboardingStack"
import { RootStackParamListHome } from "./HomeStack"
import { RootStackParamListSettings } from "./SettingsStack"
import { RootStackParamListCreateWalletApp } from "./CreateWalletAppStack"
import { RootStackParamListSwitch } from "./SwitchStack"
import { RootStackParamListDiscover } from "./DiscoverStack"
import { RootStackParamListNFT } from "./NFTStack"
import { RootStackParamListBuy } from "./BuyStack"
import { RootStackParamListBrowser } from "./BrowserStack"

export type ScreenRootParams = RootStackParamListSwitch &
    RootStackParamListOnboarding &
    RootStackParamListHome &
    RootStackParamListSettings &
    RootStackParamListCreateWalletApp &
    RootStackParamListDiscover &
    RootStackParamListNFT &
    RootStackParamListBuy &
    RootStackParamListBrowser

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ScreenRootParams {}
    }
}
