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

type Props = {
    children: React.ReactNode
}

export const SecurityProvider = ({ children }: Props) => {
    const isSecurityDowngrade = useAppSelector(selectIsSecurityDowngrade)
    const { securityDowngrade } = useSecurityDowngrade()
    const { showLockScreen } = usePasswordUnlock()
    useBiometricUnlock()

    const isAppBlocked = useAppSelector(selectIsAppBlocked)

    useEffect(() => {
        securityDowngrade()
    }, [securityDowngrade])

    if (isAppBlocked) return <AppBlockedScreen />

    if (isSecurityDowngrade) return <SecurityDowngradeScreen />

    if (showLockScreen) return showLockScreen

    return <>{children}</>
}
