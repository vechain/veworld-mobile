export * from "./HomeStack"
export * from "./OnboardingStack"
export * from "./SwitchStack"
export * from "./SettingsStack"
export * from "./CreateWalletAppStack"

import { RootStackParamListOnboarding } from "./OnboardingStack"
import { RootStackParamListHome } from "./HomeStack"
import { RootStackParamListSettings } from "./SettingsStack"
import { RootStackParamListCreateWalletApp } from "./CreateWalletAppStack"
import { RootStackParamListSwitch } from "./SwitchStack"

export type ScreenRootParams = RootStackParamListSwitch &
    RootStackParamListOnboarding &
    RootStackParamListHome &
    RootStackParamListSettings &
    RootStackParamListCreateWalletApp

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ScreenRootParams {}
    }
}
