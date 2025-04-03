import React, { useCallback } from "react"
import { DefaultBottomSheet } from "./DefaultBottomSheet"
import { useI18nContext } from "~i18n"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseButton } from "~Components/Base"

type Props = {
    onConfirm: () => void
}

export const DisabledBuySwapIosBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onConfirm }, ref) => {
    const { LL } = useI18nContext()

    const handleOnProceed = useCallback(() => {
        onConfirm()
    }, [onConfirm])

    const mainButton = (
        <BaseButton
            variant="outline"
            w={100}
            typographyFont="buttonMedium"
            haptics="Light"
            title={LL.BTN_DISMISS()}
            action={handleOnProceed}
        />
    )

    return (
        <DefaultBottomSheet
            ref={ref}
            icon="icon-alert-triangle"
            iconSize={40}
            title={LL.BLOCKED_BUY_SWAP_IOS_TITLE()}
            description={LL.BLOCKED_BUY_SWAP_IOS_SUBTITLE()}
            mainButton={mainButton}
        />
    )
})
