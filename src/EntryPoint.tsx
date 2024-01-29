import React, { useEffect } from "react"
import { AutoLockProvider, BaseStatusBar, ErrorBoundary, useApplicationSecurity } from "~Components"
import { SwitchStack } from "~Navigation"
import { AppLoader } from "./AppLoader"
import { AnimatedSplashScreen } from "./AnimatedSplashScreen"
import RNBootSplash from "react-native-bootsplash"
import { SecurityLevelType } from "~Model"
import { PlatformUtils } from "~Utils"

export const EntryPoint = () => {
    const { setIsAppReady, securityType } = useApplicationSecurity()

    useEffect(() => {
        RNBootSplash.hide({ fade: false })
        setIsAppReady(true)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
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
    )
}

const PlatformAutolock = ({ children }: { children: React.ReactElement }) => {
    if (PlatformUtils.isAndroid()) {
        return children
    } else {
        return <AutoLockProvider>{children}</AutoLockProvider>
    }
}
