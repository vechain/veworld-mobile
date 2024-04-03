import React, { useEffect } from "react"
import { AutoLockProvider, BaseStatusBar, ErrorBoundary, useApplicationSecurity } from "~Components"
import { SwitchStack } from "~Navigation"
import { AppLoader } from "./AppLoader"
import { AnimatedSplashScreen } from "./AnimatedSplashScreen"
import RNBootSplash from "react-native-bootsplash"
import { SecurityLevelType } from "~Model"
import { PlatformUtils } from "~Utils"
import { DatadogProvider, DatadogProviderConfiguration } from "@datadog/mobile-react-native"

const dd_client_id = process.env.DATADOG_CLIENT_API
const dd_application_id = process.env.DATADOG_APPLICATION_ID
if (!dd_client_id || !dd_application_id) {
    throw new Error("DATADOG environment variable is not set correctly. Please set it before running the application.")
}

// Datadog SDK configuration
const config = new DatadogProviderConfiguration(
    dd_client_id, // Client API
    "dev-test", // Environment name
    dd_application_id, // Application ID
    true, // Track user interactions
    true, // Track XHR Resources
    true, // Track Errors
)
config.site = "EU1" // Set the Datadog site
// Additional optional configurations...
config.nativeCrashReportEnabled = true // enable native crash reporting

export const EntryPoint = () => {
    const { setIsAppReady, securityType } = useApplicationSecurity()

    useEffect(() => {
        RNBootSplash.hide({ fade: false })
        setIsAppReady(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        // Wrap with DatadogProvider
        <DatadogProvider configuration={config}>
            <ErrorBoundary>
                <PlatformAutolock>
                    <AnimatedSplashScreen
                        playAnimation={true}
                        useFadeOutAnimation={securityType === SecurityLevelType.SECRET}>
                        <AppLoader>
                            <BaseStatusBar />
                            <SwitchStack />
                        </AppLoader>
                    </AnimatedSplashScreen>
                </PlatformAutolock>
            </ErrorBoundary>
        </DatadogProvider>
    )
}

const PlatformAutolock = ({ children }: { children: React.ReactElement }) => {
    if (PlatformUtils.isAndroid()) {
        return children
    } else {
        return <AutoLockProvider>{children}</AutoLockProvider>
    }
}
