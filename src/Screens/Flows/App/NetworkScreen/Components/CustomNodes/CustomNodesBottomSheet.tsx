import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
    BaseIcon,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { useTheme } from "~Common"
type Props = {
    onClose: () => void
}

const snapPoints = ["50%", "90%"]

export const CustomNodesBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const onAddNetworkPress = useCallback(() => {
        nav.navigate(Routes.SETTINGS_ADD_CUSTOM_NODE)
        onClose()
    }, [nav, onClose])

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView flexDirection="row" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.BD_CUSTOM_NODES()}
                </BaseText>
                <BaseIcon
                    name={"plus"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={onAddNetworkPress}
                />
            </BaseView>

            <BaseSpacer height={16} />
        </BaseBottomSheet>
    )
})
