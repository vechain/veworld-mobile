import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
    BaseIcon,
    BaseTouchableBox,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Hooks"
import { debug } from "~Utils"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

type Props = {
    onClose: () => void
}

const snapPoints = ["50%", "70%", "90%"]
export const ImportWalletBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const handleSheetChanges = useCallback((index: number) => {
        debug("ImportWalletBottomSheet position changed", index)
    }, [])

    const navigateToImportLocalWallet = useCallback(() => {
        onClose()
        nav.navigate(Routes.IMPORT_MNEMONIC)
    }, [nav, onClose])

    const navigateToImportHardwareWallet = useCallback(() => {
        onClose()
        nav.navigate(Routes.IMPORT_HW_LEDGER_SELECT_DEVICE)
    }, [onClose, nav])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            ref={ref}>
            <BaseView flexDirection="column" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.TITLE_IMPORT_WALLET_TYPE()}
                </BaseText>
                <BaseSpacer height={16} />
                <BaseText typographyFont="body">
                    {LL.SB_IMPORT_WALLET_TYPE()}
                </BaseText>
            </BaseView>

            <BaseSpacer height={24} />

            <BaseTouchableBox
                action={navigateToImportLocalWallet}
                py={16}
                haptics="Medium">
                <BaseIcon
                    name="wallet-plus-outline"
                    size={20}
                    color={theme.colors.text}
                />
                <BaseView flex={1} px={12}>
                    <BaseText align="left" typographyFont="subSubTitle">
                        {LL.SB_IMPORT_WALLET_TYPE_SEED()}
                    </BaseText>
                    <BaseText
                        pt={4}
                        align="left"
                        typographyFont="captionRegular">
                        {LL.BD_IMPORT_WALLET_TYPE_SEED()}
                    </BaseText>
                </BaseView>
                <BaseIcon
                    name="chevron-right"
                    size={24}
                    color={theme.colors.text}
                />
            </BaseTouchableBox>
            <BaseSpacer height={16} />
            <BaseTouchableBox
                action={navigateToImportHardwareWallet}
                py={16}
                haptics="Medium">
                <BaseIcon
                    name="bluetooth-connect"
                    size={20}
                    color={theme.colors.text}
                />
                <BaseView flex={1} px={12}>
                    <BaseText align="left" typographyFont="subSubTitle">
                        {LL.SB_IMPORT_WALLET_TYPE_HARDWARE()}
                    </BaseText>
                    <BaseText
                        pt={4}
                        align="left"
                        typographyFont="captionRegular">
                        {LL.BD_IMPORT_WALLET_TYPE_HARDWARE()}
                    </BaseText>
                </BaseView>
                <BaseIcon
                    name="chevron-right"
                    size={24}
                    color={theme.colors.text}
                />
            </BaseTouchableBox>
        </BaseBottomSheet>
    )
})
