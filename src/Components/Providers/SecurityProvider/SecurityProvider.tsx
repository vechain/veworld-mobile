import React, { useEffect } from "react"
import { usePasswordUnlock } from "./hooks/usePasswordUnlock"
import { useBiometricUnlock } from "./hooks/useBiometricUnlock"
import { useSecurityDowngrade } from "./hooks/useSecurityDowngrade"
import {
    selectIsAppBlocked,
    selectIsSecurityDowngrade,
    useAppSelector,
} from "~Storage/Redux"
import { SecurityDowngradeScreen } from "~Screens"
import { AppBlockedScreen } from "~Screens/Flows/App/AppBlockedScreen"
import { AnimatedSplashScreen } from "../../../AnimatedSplashScreen"
import { AutoLogoutProvider } from "../AutoLogoutProvider"

type Props = {
    children: React.ReactNode
}

export const SecurityProvider = ({ children }: Props) => {
    const isSecurityDowngrade = useAppSelector(selectIsSecurityDowngrade)
    const { securityDowngrade } = useSecurityDowngrade()
    const { showLockScreen, isSplashHidden } = usePasswordUnlock()
    const { isBiometricsSucceeded } = useBiometricUnlock()

    const isAppBlocked = useAppSelector(selectIsAppBlocked)

    useEffect(() => {
        securityDowngrade()
    }, [securityDowngrade])

    // App is blocked because a critical operation has failed and the user needs to reset wallet
    if (isAppBlocked)
        return (
            <AnimatedSplashScreen playAnimation={true}>
                <AppBlockedScreen />
            </AnimatedSplashScreen>
        )

    // App is blocked and the user needs to re-enable biometrics or reset wallet
    if (isSecurityDowngrade)
        return (
            <AnimatedSplashScreen playAnimation={true}>
                <SecurityDowngradeScreen />
            </AnimatedSplashScreen>
        )

    // App is locked and the user needs to unlock it
    if (showLockScreen)
        return (
            <AnimatedSplashScreen
                playAnimation={isSplashHidden || isBiometricsSucceeded}>
                {showLockScreen}
            </AnimatedSplashScreen>
        )

    // App is Unlocked or user is using biometrics to unlock
    return (
        <AutoLogoutProvider>
            <AnimatedSplashScreen
                playAnimation={isSplashHidden || isBiometricsSucceeded}>
                {children}
            </AnimatedSplashScreen>
        </AutoLogoutProvider>
    )
}
