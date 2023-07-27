import React from "react"
import { BaseStatusBar, SecurityProvider } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"
import { PinCodeProvider } from "~Components/Providers/PinCodeProvider/PinCodeProvider"
import { AppLoader } from "./AppLoader"

export const EntryPoint = () => {
    return (
        <ErrorBoundary>
            <PinCodeProvider>
                <SecurityProvider>
                    <AppLoader>
                        <BaseStatusBar />
                        <SwitchStack />
                    </AppLoader>
                </SecurityProvider>
            </PinCodeProvider>
        </ErrorBoundary>
    )
}
