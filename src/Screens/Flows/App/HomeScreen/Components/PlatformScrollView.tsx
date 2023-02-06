import { NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import React from "react"
import { isIOS } from "~Common/Utils/PlatformUtils/Platform"
import { BaseScrollView } from "~Components"

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>

type Props = {
    children: React.ReactNode
    handleScrollPOsition: (event: ScrollEvent) => void
}

export const PlatformScrollView = ({
    children,
    handleScrollPOsition,
}: Props) => {
    if (isIOS()) {
        return (
            <BaseScrollView
                grow={1}
                scrollEventThrottle={16}
                onScroll={handleScrollPOsition}>
                {children}
            </BaseScrollView>
        )
    } else {
        return <BaseScrollView grow={1}>{children}</BaseScrollView>
    }
}
