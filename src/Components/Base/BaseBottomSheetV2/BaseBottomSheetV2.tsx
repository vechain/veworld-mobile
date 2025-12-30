import React, { forwardRef, PropsWithChildren } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { BaseBottomSheetV2Backdrop } from "./BaseBottomSheetV2Backdrop"
import { BaseBottomSheetV2Handle } from "./BaseBottomSheetV2Handle"
import { BaseBottomSheetV2Panel } from "./BaseBottomSheetV2Panel"
import { BaseBottomSheetV2Root } from "./BaseBottomSheetV2Root"
import { BaseBottomSheetV2Scrollable } from "./BaseBottomSheetV2Scrollable"

type Props = PropsWithChildren<{
    handle?: boolean
    onDismiss?: () => void
    contentStyle?: StyleProp<ViewStyle>
}>

export type BaseBottomSheetV2Ref = {
    present: (data?: unknown) => void
    close: () => void
}

export const BaseBottomSheetV2 = forwardRef<BaseBottomSheetV2Ref, Props>(function TestBottomSheet(
    { children, handle = true, onDismiss },
    ref,
) {
    return (
        <BaseBottomSheetV2Root onDismiss={onDismiss} ref={ref}>
            <BaseBottomSheetV2Backdrop />
            <BaseBottomSheetV2Panel>
                {handle && <BaseBottomSheetV2Handle />}
                <BaseBottomSheetV2Scrollable>{children}</BaseBottomSheetV2Scrollable>
            </BaseBottomSheetV2Panel>
        </BaseBottomSheetV2Root>
    )
})
