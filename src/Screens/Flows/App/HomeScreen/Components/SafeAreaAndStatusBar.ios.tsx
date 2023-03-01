import React, { memo } from "react"
import { SharedValue } from "react-native-reanimated"
import { PlatformUtils } from "~Common"
import { BaseStatusBar, FadableSafeAreaTop } from "~Components"

type Props = {
    statusBarContent: boolean
    scrollValue: SharedValue<number>
}

export const SafeAreaAndStatusBar = memo(
    ({ statusBarContent, scrollValue }: Props) => {
        if (PlatformUtils.isIOS()) {
            return (
                <>
                    <BaseStatusBar contentBasedOnScroll={statusBarContent} />
                    <FadableSafeAreaTop scrollValue={scrollValue} />
                </>
            )
        }

        return <></>
    },
)
