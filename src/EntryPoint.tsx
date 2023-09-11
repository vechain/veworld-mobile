import React, { useEffect } from "react"
import { BaseStatusBar } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"
import { PinCodeProvider } from "~Components/Providers/PinCodeProvider/PinCodeProvider"
import { AppLoader } from "./AppLoader"
import RNBootSplash from "react-native-bootsplash"
import { AutoLogoutProvider } from "~Components/Providers/AutoLogoutProvider"
import { AnimatedSplashScreen } from "./AnimatedSplashScreen"

export const EntryPoint = () => {
    useEffect(() => {
        RNBootSplash.hide({ fade: true, duration: 500 })
    }, [])

    return (
        <ErrorBoundary>
            <PinCodeProvider>
                <AutoLogoutProvider>
                    <AnimatedSplashScreen
                        playAnimation={true}
                        useFadeOutAnimation={true}>
                        <AppLoader>
                            <BaseStatusBar />
                            <SwitchStack />
                        </AppLoader>
                    </AnimatedSplashScreen>
                </AutoLogoutProvider>
            </PinCodeProvider>
        </ErrorBoundary>
    )
}
