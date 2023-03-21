export * from "./HomeStack"
export * from "./OnboardingStack"
export * from "./SwitchStack"
export * from "./SettingsStack"
export * from "./CreateWalletAppStack"
export * from "./CameraStack"

import { RootStackParamListOnboarding } from "./OnboardingStack"
import { RootStackParamListHome } from "./HomeStack"
import { RootStackParamListSettings } from "./SettingsStack"
import { RootStackParamListCreateWalletApp } from "./CreateWalletAppStack"
import { RootStackParamListCamera } from "./CameraStack"

export type ScreenRootParams = RootStackParamListOnboarding &
    RootStackParamListHome &
    RootStackParamListSettings &
    RootStackParamListCreateWalletApp &
    RootStackParamListCamera

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ScreenRootParams {}
    }
}
