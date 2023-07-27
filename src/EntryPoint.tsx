import React from "react"
import { BaseStatusBar, SecurityProvider } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"
import { PinCodeProvider } from "~Components/Providers/PinCodeProvider/PinCodeProvider"

export const EntryPoint = () => {
    return (
        <ErrorBoundary>
            <PinCodeProvider>
                <SecurityProvider>
                    <>
                        <BaseStatusBar />
                        <SwitchStack />
                    </>
                </SecurityProvider>
            </PinCodeProvider>
        </ErrorBoundary>
    )
}
