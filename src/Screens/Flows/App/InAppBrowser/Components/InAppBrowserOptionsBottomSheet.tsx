import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { forwardRef } from "react"
import { BaseBottomSheet, BaseText, BaseView } from "~Components"

type Props = {
    onClose: () => void
}

export const InAppBrowserOptionsBottomSheet = forwardRef<BottomSheetModal, Props>((props, ref) => {
    return (
        <BaseBottomSheet dynamicHeight ref={ref}>
            <BaseView>
                <BaseText>{"Test"}</BaseText>
            </BaseView>
        </BaseBottomSheet>
    )
})
