import React, { useEffect } from "react"
import { BaseStatusBar, useEncryptedStorage } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"
import { AppLoader } from "./AppLoader"
import { AutoLogoutProvider } from "~Components/Providers/AutoLogoutProvider"
import { AnimatedSplashScreen } from "../src/AnimatedSplashScreen"
import RNBootSplash from "react-native-bootsplash"
import { SecurityLevelType } from "~Model"

export const EntryPoint = () => {
    const { setIsAppReady, securityType } = useEncryptedStorage()

    useEffect(() => {
        RNBootSplash.hide({ fade: false })
        setIsAppReady(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <ErrorBoundary>
            <AutoLogoutProvider>
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
            </AutoLogoutProvider>
        </ErrorBoundary>
    )
}
