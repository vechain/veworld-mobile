import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Hooks"

type Props = {
    title: string
    description: string
    deletingElement?: React.ReactNode
    onClose: () => void
    onConfirm: () => void
}

const snapPoints = ["55%"]

export const DeleteConfirmationBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onConfirm, title, description, deletingElement }, ref) => {
    const { LL } = useI18nContext()

    const theme = useTheme()

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView
                h={100}
                alignItems="center"
                justifyContent="space-between"
                flexGrow={1}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="subTitleBold">{title}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body" my={8}>
                        {description}
                    </BaseText>
                    <BaseSpacer height={16} />
                    {deletingElement}
                </BaseView>

                <BaseView
                    flexDirection="row"
                    justifyContent="space-between"
                    w={100}
                    alignItems="center">
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
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})
