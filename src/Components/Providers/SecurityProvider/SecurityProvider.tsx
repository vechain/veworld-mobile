import React, { useEffect } from "react"
import { usePasswordUnlock } from "./hooks/usePasswordUnlock"
import { useBiometricUnlock } from "./hooks/useBiometricUnlock"
import { useSecurityDowngrade } from "./hooks/useSecurityDowngrade"
import { selectIsSecurityDowngrade, useAppSelector } from "~Storage/Redux"
import { SecurityDowngradeScreen } from "~Screens"
import { SplashScreen } from "../../../SplashScreen"

type Props = {
    children: React.ReactNode
}

export const SecurityProvider = ({ children }: Props) => {
    const isSecurityDowngrade = useAppSelector(selectIsSecurityDowngrade)
    const { securityDowngrade } = useSecurityDowngrade()
    const { showLockScreen, isSplashHidden } = usePasswordUnlock()
    useBiometricUnlock()

    useEffect(() => {
        securityDowngrade()
    }, [securityDowngrade])

    if (isSecurityDowngrade) return <SecurityDowngradeScreen />

    if (showLockScreen)
        return (
            <SplashScreen playAnimation={isSplashHidden}>
                {showLockScreen}
            </SplashScreen>
        )

    return (
        <SplashScreen playAnimation={isSplashHidden}>{children}</SplashScreen>
    )
}
