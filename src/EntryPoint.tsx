import React from "react"
import { BaseStatusBar, SecurityProvider } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"
import { SplashScreen } from "./SplashScreen"

export const EntryPoint = () => {
    return (
        <ErrorBoundary>
            <SecurityProvider>
                <>
                    <SplashScreen>
                        <BaseStatusBar />
                        <SwitchStack />
                    </SplashScreen>
                </>
            </SecurityProvider>
        </ErrorBoundary>
    )
}
