import React, { useEffect } from "react"
import { BaseStatusBar, useApplicationSecurity } from "~Components"
import { SwitchStack } from "~Navigation"
import ErrorBoundary from "~Components/Providers/ErrorBoundary"
import { AppLoader } from "./AppLoader"
import {
    AUTO_LOGOUT_TASK,
    AutoLogoutProvider,
} from "~Components/Providers/AutoLogoutProvider"
import { AnimatedSplashScreen } from "../src/AnimatedSplashScreen"
import RNBootSplash from "react-native-bootsplash"
import { SecurityLevelType } from "~Model"
import * as BackgroundFetch from "expo-background-fetch"
import * as TaskManager from "expo-task-manager"
import { debug } from "~Utils"
import GlobalEventEmitter, { LOCK_APP_EVENT } from "~Events/GlobalEventEmitter"

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(AUTO_LOGOUT_TASK, () => {
    debug("Triggering lock app event")
    GlobalEventEmitter.emit(LOCK_APP_EVENT)
    return BackgroundFetch.BackgroundFetchResult.NewData
})

export const EntryPoint = () => {
    const { setIsAppReady, securityType } = useApplicationSecurity()

    useEffect(() => {
        RNBootSplash.hide({ fade: false })
        setIsAppReady(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <ErrorBoundary>
            <AutoLogoutProvider>
                <AnimatedSplashScreen
                    playAnimation={true}
                    useFadeOutAnimation={
                        securityType === SecurityLevelType.SECRET
                    }>
                    <AppLoader>
                        <BaseStatusBar />
                        <SwitchStack />
                    </AppLoader>
                </AnimatedSplashScreen>
            </AutoLogoutProvider>
        </ErrorBoundary>
    )
}
