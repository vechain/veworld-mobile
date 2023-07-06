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
import { AnimatedSplashScreen } from "../../../AnimatedSplashScreen"
import { AppBlockedScreen } from "~Screens/Flows/App/AppBlockedScreen"

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

    if (isAppBlocked)
        return (
            <AnimatedSplashScreen playAnimation={true}>
                <AppBlockedScreen />
            </AnimatedSplashScreen>
        )

    if (isSecurityDowngrade)
        return (
            <AnimatedSplashScreen playAnimation={true}>
                <SecurityDowngradeScreen />
            </AnimatedSplashScreen>
        )

    if (showLockScreen)
        return (
            <AnimatedSplashScreen
                playAnimation={isSplashHidden || isBiometricsSucceeded}>
                {showLockScreen}
            </AnimatedSplashScreen>
        )

    return (
        <AnimatedSplashScreen
            playAnimation={isSplashHidden || isBiometricsSucceeded}>
            {children}
        </AnimatedSplashScreen>
    )
}
