import React from "react"
import { SharedValue } from "react-native-reanimated"
import { isIOS } from "~Common/Utils/PlatformUtils/Platform"
import { BaseStatusBar, FadableSafeAreaTop } from "~Components"

type Props = {
    statusBarContent: boolean
    scrollValue: SharedValue<number>
}

export const SafeAreaAndStatusBar = ({
    statusBarContent,
    scrollValue,
}: Props) => {
    if (isIOS()) {
        return (
            <>
                <BaseStatusBar contentBasedOnScroll={statusBarContent} />
                <FadableSafeAreaTop scrollValue={scrollValue} />
            </>
        )
    }

    return <></>
}
