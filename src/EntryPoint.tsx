import React from "react"
import { BaseStatusBar, SecurityProvider } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"

export const EntryPoint = () => {
    return (
        <ErrorBoundary>
            <SecurityProvider>
                <>
                    <BaseStatusBar />
                    <SwitchStack />
                </>
            </SecurityProvider>
        </ErrorBoundary>
    )
}
