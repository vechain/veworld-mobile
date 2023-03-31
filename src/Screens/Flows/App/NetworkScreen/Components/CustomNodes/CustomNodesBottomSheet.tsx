import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseView, BaseBottomSheet } from "~Components"
import { useI18nContext } from "~i18n"
type Props = {
    onClose: () => void
}

const snapPoints = ["50%", "90%"]

export const CustomNodesBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({}, ref) => {
    const { LL } = useI18nContext()
    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView flexDirection="column" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.BD_CUSTOM_NODES()}
                </BaseText>
            </BaseView>

            <BaseSpacer height={16} />
        </BaseBottomSheet>
    )
})
