import React, { useEffect } from "react"
// Import Datadog SDK dependencies
import { Button, View } from "react-native"

import { DatadogProvider, DatadogProviderConfiguration } from "@datadog/mobile-react-native"
import { crashJavascriptThread, crashNativeMainThread } from "react-native-performance-limiter"

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
    "pub73c67659859b7626e182f39bdd46f484",
    "dev-test",
    "58c5bbac-e4d2-4be2-bfe2-f36002173ce4",
    true, // Track user interactions
    true, // Track XHR Resources
    true, // Track Errors
)
config.site = "EU1" // Set the Datadog site
// Additional optional configurations...
config.nativeCrashReportEnabled = true // enable native crash reporting

const crashApp = () => {
    crashNativeMainThread("Test crash here on entry Native ")
}
const crashAppJS = () => {
    crashJavascriptThread("custom error message Javascript")
}

export const EntryPoint = () => {
    const { setIsAppReady, securityType } = useApplicationSecurity()

    useEffect(() => {
        RNBootSplash.hide({ fade: false })
        setIsAppReady(true)
    }, [setIsAppReady])

    return (
        <DatadogProvider configuration={config}>
            <ErrorBoundary>
                <PlatformAutolock>
                    <AnimatedSplashScreen
                        playAnimation={true}
                        useFadeOutAnimation={securityType === SecurityLevelType.SECRET}>
                        <AppLoader>
                            <BaseStatusBar />
                            {/* Centered Buttons */}
                            {/*<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>*/}
                            <View>
                                <Button title="Crash Native Thread" onPress={() => crashApp()} />
                                <Button title="Crash JS Thread" onPress={() => crashAppJS()} />
                            </View>
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
