import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
    CustomTokenCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Common"
import { FungibleToken } from "~Model"

type Props = {
    onClose: () => void
    onConfirm: () => void
    token?: FungibleToken
}

const snapPoints = ["50%"]

export const DeleteCustomTokenBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onConfirm, token }, ref) => {
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
                {LL.MANAGE_CUSTOM_TOKENS_CONFIRM_TOKEN_DELETION()}
            </BaseText>

            <BaseSpacer height={16} />
            <CustomTokenCard token={token!!} />
            <BaseSpacer height={32} />

            <BaseView alignItems="center" w={100}>
                <BaseButton
                    action={onConfirm}
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
