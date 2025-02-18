import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    txId?: string
    amount?: string
    to?: "B3TR" | "VOT3"
    onClose: () => void
}

export const ConvertBetterTokenSuccessBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ txId, onClose }, ref) => {
        const { LL } = useI18nContext()
        const theme = useTheme()

        return (
            <BaseBottomSheet ref={ref} blurBackdrop enablePanDownToClose dynamicHeight>
                <BaseView>
                    <BaseView alignItems="center">
                        <BaseIcon name="icon-check-circle" size={32} color={theme.colors.text} />
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subSubTitleSemiBold">{"Tokens converted succesfully!"}</BaseText>
                        <BaseSpacer height={32} />
                        {txId && <BaseText>{"See transaction details"}</BaseText>}
                    </BaseView>

                    <BaseButton action={onClose}>{LL.COMMON_BTN_OK()}</BaseButton>
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
