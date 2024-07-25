import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseView, BaseBottomSheet, BaseIcon, BaseTouchableBox } from "~Components"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useTheme } from "~Hooks"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { AnalyticsEvent } from "~Constants"
import { selectHasOnboarded, useAppSelector } from "~Storage/Redux"
import { RumManager } from "~Logging"

type Props = {
    onClose: () => void
    handleOnCreateWallet: () => void
}

export const CreateOrImportWalletBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, handleOnCreateWallet }, ref) => {
        const { LL } = useI18nContext()
        const nav = useNavigation()
        const theme = useTheme()
        const track = useAnalyticTracking()
        const userHasOnboarded = useAppSelector(selectHasOnboarded)
        const ddLogger = useMemo(() => new RumManager(), [])

        const navigateToImportLocalWallet = useCallback(() => {
            track(AnalyticsEvent.SELECT_WALLET_IMPORT_MNEMONIC)
            onClose()
            nav.navigate(Routes.IMPORT_MNEMONIC)
        }, [nav, onClose, track])

        const navigateToImportHardwareWallet = useCallback(() => {
            track(AnalyticsEvent.SELECT_WALLET_IMPORT_HARDWARE)
            onClose()
            nav.navigate(Routes.IMPORT_HW_LEDGER_SELECT_DEVICE, { context: "management" })
        }, [track, onClose, nav])

        const onObserveWallet = useCallback(() => {
            onClose()
            track(AnalyticsEvent.SELECT_WALLET_OBSERVE_WALLET)
            ddLogger.logAction("WALLET_SETUP_SCREEN", "SELECT_WALLET_OBSERVE_WALLET")
            setTimeout(() => {
                nav.navigate(Routes.OBSERVE_WALLET)
            }, 400)
        }, [nav, track, ddLogger, onClose])

        return (
            <BaseBottomSheet dynamicHeight ref={ref}>
                <BaseView flexDirection="column" w={100}>
                    <BaseText typographyFont="subTitleBold">{LL.TITLE_CREATE_WALLET_TYPE()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body">{LL.BD_CREATE_WALLET_TYPE()}</BaseText>
                </BaseView>

                <BaseSpacer height={32} />

                <BaseTouchableBox action={handleOnCreateWallet} py={16} haptics="Medium">
                    <BaseIcon name="plus-circle" size={24} color={theme.colors.text} />
                    <BaseView flex={1} px={12}>
                        <BaseText align="left" typographyFont="subSubTitle">
                            {LL.BTN_CREATE_WALLET_TYPE_CREATE_NEW()}
                        </BaseText>
                        <BaseText pt={4} align="left" typographyFont="captionRegular">
                            {LL.BTN_CREATE_WALLET_TYPE_CREATE_NEW_SUBTITLE()}
                        </BaseText>
                    </BaseView>
                    <BaseIcon name="chevron-right" size={24} color={theme.colors.text} />
                </BaseTouchableBox>

                <BaseSpacer height={16} />

                <BaseTouchableBox action={navigateToImportLocalWallet} py={16} haptics="Medium">
                    <BaseIcon name="wallet-plus-outline" size={20} color={theme.colors.text} />
                    <BaseView flex={1} px={12}>
                        <BaseText align="left" typographyFont="subSubTitle">
                            {LL.SB_IMPORT_WALLET_TYPE_SEED()}
                        </BaseText>
                        <BaseText pt={4} align="left" typographyFont="captionRegular">
                            {LL.BD_IMPORT_WALLET_TYPE_SEED()}
                        </BaseText>
                    </BaseView>
                    <BaseIcon name="chevron-right" size={24} color={theme.colors.text} />
                </BaseTouchableBox>

                <BaseSpacer height={16} />

                <BaseTouchableBox action={navigateToImportHardwareWallet} py={16} haptics="Medium">
                    <BaseIcon name="bluetooth-connect" size={20} color={theme.colors.text} />
                    <BaseView flex={1} px={12}>
                        <BaseText align="left" typographyFont="subSubTitle">
                            {LL.SB_IMPORT_WALLET_TYPE_HARDWARE()}
                        </BaseText>
                        <BaseText pt={4} align="left" typographyFont="captionRegular">
                            {LL.BD_IMPORT_WALLET_TYPE_HARDWARE()}
                        </BaseText>
                    </BaseView>
                    <BaseIcon name="chevron-right" size={24} color={theme.colors.text} />
                </BaseTouchableBox>

                <BaseSpacer height={16} />

                {userHasOnboarded && (
                    <>
                        <BaseTouchableBox
                            testID="import-observe-wallet-button"
                            haptics="Medium"
                            action={onObserveWallet}
                            py={16}
                            justifyContent="space-between">
                            <BaseIcon name="account-supervisor" size={24} color={theme.colors.text} />
                            <BaseView flex={1} px={12}>
                                <BaseText align="left" typographyFont="subSubTitle">
                                    {LL.BTN_OBSERVE_WALLET()}
                                </BaseText>
                                <BaseText align="left" pt={4} typographyFont="captionRegular">
                                    {LL.BTN_OBSERVE_WALLET_SUBTITLE()}
                                </BaseText>
                            </BaseView>
                            <BaseIcon name="chevron-right" size={24} color={theme.colors.text} />
                        </BaseTouchableBox>

                        <BaseSpacer height={16} />
                    </>
                )}
            </BaseBottomSheet>
        )
    },
)
