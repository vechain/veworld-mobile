import { NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import React from "react"
import { BaseScrollView } from "~Components"
import { PlatformUtils } from "~Common"

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>

type Props = {
    children: React.ReactNode
    handleScrollPosition: (event: ScrollEvent) => void
}

export const PlatformScrollView = ({
    children,
    handleScrollPosition,
}: Props) => {
    if (PlatformUtils.isIOS()) {
        return (
            <BaseScrollView
                grow={1}
                scrollEventThrottle={16}
                onScroll={handleScrollPosition}>
                {children}
            </BaseScrollView>
        )
    } else {
        return <BaseScrollView grow={1}>{children}</BaseScrollView>
    }
}
