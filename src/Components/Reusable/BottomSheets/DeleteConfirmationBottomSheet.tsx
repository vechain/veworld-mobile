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
import { useTheme } from "~Common"

type Props = {
    title: string
    description: string
    additionalContent?: React.ReactNode
    onClose: () => void
    onConfirm: () => void
}

const snapPoints = ["50%"]

export const DeleteConfirmationBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onConfirm, title, description, additionalContent }, ref) => {
    const { LL } = useI18nContext()

    const theme = useTheme()

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView flexGrow={1}>
                <BaseView
                    alignItems="center"
                    justifyContent="space-between"
                    flexGrow={1}>
                    <BaseView w={100}>
                        <BaseText typographyFont="subTitleBold">
                            {title}
                        </BaseText>

                        <BaseSpacer height={16} />

                        <BaseText typographyFont="buttonRegular" my={8}>
                            {description}
                        </BaseText>

                        {additionalContent && <BaseSpacer height={16} />}
                        {additionalContent}
                    </BaseView>
                    <BaseView alignItems="center" alignSelf="stretch" w={100}>
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
