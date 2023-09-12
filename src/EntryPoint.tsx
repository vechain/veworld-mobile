import React, { useEffect } from "react"
import { BaseStatusBar, useEncryptedStorage } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"
import { PinCodeProvider } from "~Components/Providers/PinCodeProvider/PinCodeProvider"
import { AppLoader } from "./AppLoader"
import { AutoLogoutProvider } from "~Components/Providers/AutoLogoutProvider"
import { AnimatedSplashScreen } from "../src/AnimatedSplashScreen"
import RNBootSplash from "react-native-bootsplash"

export const EntryPoint = () => {
    const { setIsAppReady } = useEncryptedStorage()

    useEffect(() => {
        RNBootSplash.hide({ fade: false })
        setIsAppReady(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
