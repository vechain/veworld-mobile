import React from "react"
import { BaseStatusBar, SecurityProvider } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"
import BlockListener from "./BlockListener"

export const EntryPoint = () => {
    return (
        <ErrorBoundary>
            <SecurityProvider>
                <>
                    <BlockListener />
                    <BaseStatusBar />
                    <SwitchStack />
                </>
            </SecurityProvider>
        </ErrorBoundary>
    )
}
