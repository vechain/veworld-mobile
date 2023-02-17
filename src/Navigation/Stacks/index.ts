export * from "./HomeStack"
export * from "./OnboardingStack"
export * from "./SwitchStack"
export * from "./SettingsStack"
export * from "./CreateWalletAppStack"

import { RootStackParamListOnboarding } from "./OnboardingStack"
import { RootStackParamListHome } from "./HomeStack"
import { RootStackParamListSettings } from "./SettingsStack"
import { RootStackParamListCreateWalletApp } from "./CreateWalletAppStack"

export type ScreenRootParams = RootStackParamListOnboarding &
    RootStackParamListHome &
    RootStackParamListSettings &
    RootStackParamListCreateWalletApp

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ScreenRootParams {}
    }
}
