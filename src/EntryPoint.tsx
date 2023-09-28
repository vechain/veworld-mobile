import React, { useEffect } from "react"
import { BaseStatusBar, useApplicationSecurity } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"
import { AppLoader } from "./AppLoader"
import { AutoLockProvider } from "~Components/Providers/AutoLockProvider"
import { AnimatedSplashScreen } from "../src/AnimatedSplashScreen"
import RNBootSplash from "react-native-bootsplash"
import { SecurityLevelType } from "~Model"

export const EntryPoint = () => {
    const { setIsAppReady, securityType } = useApplicationSecurity()

    useEffect(() => {
        RNBootSplash.hide({ fade: false })
        setIsAppReady(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <ErrorBoundary>
            <AutoLockProvider>
                <AnimatedSplashScreen
                    playAnimation={true}
                    useFadeOutAnimation={
                        securityType === SecurityLevelType.SECRET
                    }>
                    <AppLoader>
                        <BaseStatusBar />
                        <SwitchStack />
                    </AppLoader>
                </AnimatedSplashScreen>
            </AutoLockProvider>
        </ErrorBoundary>
    )
}
