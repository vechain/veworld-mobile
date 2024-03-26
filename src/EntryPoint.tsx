import React, { useEffect } from "react"
// Import Datadog SDK dependencies
import { DatadogProvider, DatadogProviderConfiguration } from "@datadog/mobile-react-native"
//import { crashNativeMainThread } from 'react-native-performance-limiter';

// Existing imports
import { AutoLockProvider, BaseStatusBar, ErrorBoundary, useApplicationSecurity } from "~Components"
import { SwitchStack } from "~Navigation"
import { AppLoader } from "./AppLoader"
import { AnimatedSplashScreen } from "./AnimatedSplashScreen"
import RNBootSplash from "react-native-bootsplash"
import { SecurityLevelType } from "~Model"
import { PlatformUtils } from "~Utils"

// Datadog SDK configuration
const config = new DatadogProviderConfiguration(
    "pubfcce59cd78594f40fb3dba62fc34280b", // Replace with your actual client token
    "dev-test", // Environment name
    "4b98025d-dc62-423c-8ee3-4e9002448328", // Application ID
    true, // Track user interactions
    true, // Track XHR Resources
    true, // Track Errors
)
config.site = "EU1" // Set the Datadog site
// Additional optional configurations...
config.nativeCrashReportEnabled = true // enable native crash reporting

//const crashApp = () => {
//   crashNativeMainThread('Test crash here on entry Native ');
//};
//const crashApp2 = () => {
//    crashJavascriptThread('custom error message Javascript');
//};

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
