import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useTheme } from "~Hooks"
import { debug, PlatformUtils } from "~Utils"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { AnalyticsEvent, ERROR_EVENTS } from "~Constants"

type Props = {
    onClose: () => void
}

export const ImportWalletBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()
    const track = useAnalyticTracking()

    const handleSheetChanges = useCallback((index: number) => {
        debug(ERROR_EVENTS.WALLET_CREATION, "ImportWalletBottomSheet position changed", index)
    }, [])

    const navigateToImportLocalWallet = useCallback(() => {
        track(AnalyticsEvent.SELECT_WALLET_IMPORT_MNEMONIC)
        onClose()
        nav.navigate(Routes.IMPORT_MNEMONIC)
    }, [nav, onClose, track])

    const navigateToImportHardwareWallet = useCallback(() => {
        track(AnalyticsEvent.SELECT_WALLET_IMPORT_HARDWARE)
        onClose()
        nav.navigate(Routes.IMPORT_HW_LEDGER_SELECT_DEVICE)
    }, [track, onClose, nav])

    return (
        <BaseBottomSheet dynamicHeight onChange={handleSheetChanges} ref={ref}>
            <BaseView flexDirection="column" w={100}>
                <BaseText typographyFont="subTitleBold">{LL.TITLE_IMPORT_WALLET_TYPE()}</BaseText>
                <BaseSpacer height={16} />
                <BaseText typographyFont="body">{LL.SB_IMPORT_WALLET_TYPE()}</BaseText>
            </BaseView>

            <BaseSpacer height={24} />

            <BaseTouchableBox action={navigateToImportLocalWallet} py={16} haptics="Medium">
                <BaseIcon name="icon-file-spreadsheet" size={20} color={theme.colors.text} />
                <BaseView flex={1} px={12}>
                    <BaseText align="left" typographyFont="subSubTitle">
                        {LL.SB_IMPORT_WALLET_TYPE_SEED()}
                    </BaseText>
                    <BaseText pt={4} align="left" typographyFont="captionRegular">
                        {LL.BD_IMPORT_WALLET_TYPE_SEED({ cloud: PlatformUtils.isIOS() ? "iCloud" : "Google Drive" })}
                    </BaseText>
                </BaseView>
                <BaseIcon name="icon-chevron-right" size={24} color={theme.colors.text} />
            </BaseTouchableBox>
            <BaseSpacer height={16} />
            <BaseTouchableBox action={navigateToImportHardwareWallet} py={16} haptics="Medium">
                <BaseIcon name="icon-bluetooth-connected" size={20} color={theme.colors.text} />
                <BaseView flex={1} px={12}>
                    <BaseText align="left" typographyFont="subSubTitle">
                        {LL.SB_IMPORT_WALLET_TYPE_HARDWARE()}
                    </BaseText>
                    <BaseText pt={4} align="left" typographyFont="captionRegular">
                        {LL.BD_IMPORT_WALLET_TYPE_HARDWARE()}
                    </BaseText>
                </BaseView>
                <BaseIcon name="icon-chevron-right" size={24} color={theme.colors.text} />
            </BaseTouchableBox>
            <BaseSpacer height={16} />
        </BaseBottomSheet>
    )
})
