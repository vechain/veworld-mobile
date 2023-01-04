export * from './HomeStack'
export * from './OnboardingStack'
export * from './SwitchStack'

import {RootStackParamListOnboarding} from './OnboardingStack'
import {RootStackParamListHome} from './HomeStack'

type ScreenRootParams = RootStackParamListOnboarding & RootStackParamListHome

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ScreenRootParams {}
    }
}
