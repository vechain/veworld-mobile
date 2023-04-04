import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Common"

type Props = {
    onClose: () => void
    onRemoveContact: () => void
}

const snapPoints = ["40%"]

export const ContactRemoveBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onRemoveContact }, ref) => {
    const { LL } = useI18nContext()

    const theme = useTheme()

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                w={100}
                alignItems="center">
                <BaseText typographyFont="subTitleBold">
                    {LL.SB_CONFIRM_OPERATION()}
                </BaseText>
            </BaseView>

            <BaseSpacer height={16} />

            <BaseText typographyFont="body" my={8}>
                {LL.BD_CONFIRM_REMOVE_CONTACT()}
            </BaseText>

            <BaseSpacer height={32} />

            <BaseView alignItems="center" w={100}>
                <BaseButton
                    action={onRemoveContact}
                    w={100}
                    px={20}
                    title={LL.COMMON_BTN_REMOVE().toUpperCase()}
                    bgColor={theme.colors.primary}
                />
                <BaseButton
                    variant="outline"
                    action={onClose}
                    w={100}
                    my={10}
                    title={LL.COMMON_BTN_CANCEL().toUpperCase()}
                />
            </BaseView>
        </BaseBottomSheet>
    )
})
