import React, { useEffect } from "react"
import { InteractionManager, NativeModules } from "react-native"
import RNBootSplash from "react-native-bootsplash"
import RNScreenshotPrevent from "react-native-screenshot-prevent"
import { AutoLockProvider, BaseStatusBar, ErrorBoundary, useApplicationSecurity } from "~Components"
import { SecurityLevelType } from "~Model"
import { SwitchStack } from "~Navigation"
import { PlatformUtils } from "~Utils"
import { AnimatedSplashScreen } from "./AnimatedSplashScreen"
import { AppLoader } from "./AppLoader"
const { ScreenShieldRN } = NativeModules

export const EntryPoint = () => {
    const { setIsAppReady, securityType } = useApplicationSecurity()

    useEffect(() => {
        RNBootSplash.hide({ fade: false })
        setIsAppReady(true)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
