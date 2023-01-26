export * from "./HomeStack"
export * from "./OnboardingStack"
export * from "./WalletStack"
export * from "./SwitchStack"

import { RootStackParamListOnboarding } from "./OnboardingStack"
import { RootStackParamListHome } from "./HomeStack"
import { RootStackParamListWallet } from "./WalletStack"

type ScreenRootParams = RootStackParamListOnboarding &
    RootStackParamListHome &
    RootStackParamListWallet

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ScreenRootParams {}
    }
}
