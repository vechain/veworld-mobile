import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    onClose: () => void
}

export const NFTReportSuccessBottomsheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { LL } = useI18nContext()

    const mainButton = (
        <BaseButton
            w={100}
            typographyFont="buttonMedium"
            haptics="Light"
            variant="outline"
            title={LL.COMMON_BTN_OK()}
            action={onClose}
        />
    )

    return (
        <DefaultBottomSheet
            ref={ref}
            title={LL.NFT_COLLECTION_REPORTED()}
            description={LL.NFT_COLLECTION_REPORTED_MSG()}
            mainButton={mainButton}
            enablePanDownToClose={false}
            icon="icon-check-circle"
        />
    )
})
