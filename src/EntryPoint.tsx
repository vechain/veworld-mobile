import React, { useEffect } from "react"
import { InteractionManager, NativeModules } from "react-native"
import RNBootSplash from "react-native-bootsplash"
import RNScreenshotPrevent from "react-native-screenshot-prevent"
import { AutoLockProvider, BaseStatusBar, ErrorBoundary, useApplicationSecurity, useFeatureFlags } from "~Components"
import { SecurityLevelType } from "~Model"
import { SwitchStack } from "~Navigation"
import { PlatformUtils } from "~Utils"
import { AnimatedSplashScreen } from "./AnimatedSplashScreen"
import { AppLoader } from "./AppLoader"
import { SmartWalletAuthGate } from "~Components/Providers/SmartWalletAuthGate"
const { ScreenShieldRN } = NativeModules

export const EntryPoint = () => {
    const { setIsAppReady, securityType } = useApplicationSecurity()
    const { isLoading } = useFeatureFlags()

    useEffect(() => {
        // If the feature flags are still loading, don't hide the splash screen
        if (!isLoading) {
            RNBootSplash.hide({ fade: false })
            setIsAppReady(true)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading])

    useEffect(() => {
        // NOTE -- DO NOT REMOVE -- Feature dissabled for the time beeing
        if (false) {
            /* (IOS, Android) for android might be the only step to get secureView
             * on IOS enables blurry view when app goes into inactive state
             */
            RNScreenshotPrevent.enabled(true)

            if (PlatformUtils.isIOS()) {
                /* (IOS) enableSecureView for IOS13+
                 * creates a hidden secureTextField which prevents Application UI capture on screenshots
                 */
                RNScreenshotPrevent.enableSecureView()

                InteractionManager.runAfterInteractions(() => {
                    ScreenShieldRN.protectScreenRecording()
                })
            }
        }
    }, [])

    return (
        <ErrorBoundary>
            <PlatformAutolock>
                <AnimatedSplashScreen
                    playAnimation={true}
                    useFadeOutAnimation={securityType === SecurityLevelType.SECRET}>
                    <AppLoader>
                        <BaseStatusBar root />
                        <SwitchStack />
                        <SmartWalletAuthGate />
                    </AppLoader>
                </AnimatedSplashScreen>
            </PlatformAutolock>
        </ErrorBoundary>
    )
}

const PlatformAutolock = ({ children }: { children: React.ReactElement }) => {
    if (PlatformUtils.isAndroid()) {
        return children
    } else {
        return <AutoLockProvider>{children}</AutoLockProvider>
    }
}
