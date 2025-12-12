import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject } from "react"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
}

export const HiddenCollectionBottomSheet = ({ bsRef }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { onClose } = useBottomSheetModal({ externalRef: bsRef })

    const mainButton = (
        <BaseButton
            testID="HIDDEN_COLLECTION_BOTTOMSHEET_BTN_OK"
            title={LL.COMMON_BTN_OK()}
            action={onClose}
            variant="outline"
            haptics="Medium"
            flex={1}
            typographyFont="bodySemiBold"
        />
    )

    return (
        <DefaultBottomSheet
            testId="HIDDEN_COLLECTION_BOTTOMSHEET"
            ref={bsRef}
            enablePanDownToClose={false}
            title={LL.COLLECTION_HIDDEN_TITLE()}
            description={LL.COLLECTION_HIDDEN_DESCRIPTION()}
            mainButton={mainButton}
            iconSize={40}
            icon="icon-eye-off"
            buttonsInLine={true}
            backgroundColor={theme.colors.actionBottomSheet.background}
            textColor={theme.colors.horizontalButtonTextReversed}
        />
    )
}
