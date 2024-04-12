import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect } from "react"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView, Layout } from "~Components"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useBottomSheetModal, useTheme } from "~Hooks"
import { ImportWalletBottomSheet } from "./components"
import { WalletSetupSvg } from "~Assets"
import { AnalyticsEvent } from "~Constants"
import { selectHasOnboarded, useAppSelector } from "~Storage/Redux"
import { DdRum, RumActionType } from "@datadog/mobile-react-native"

export const WalletSetupScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const theme = useTheme()
    const track = useAnalyticTracking()
    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const { ref, onOpen, onClose } = useBottomSheetModal()

    const createLocalWallet = useCallback(async () => {
        DdRum.startView("Wallet_Setup_Screen", "Wallet_Setup_Screen", {}, Date.now())
        DdRum.addAction(RumActionType.TAP, "SELECT_WALLET_CREATE_WALLET") // Log specific user action
        DdRum.stopView("Wallet_Setup_Screen")
        track(AnalyticsEvent.SELECT_WALLET_CREATE_WALLET)
        nav.navigate(Routes.NEW_MNEMONIC)
    }, [nav, track])

    const onImportWallet = useCallback(async () => {
        DdRum.startView("Wallet_Setup_Screen", "Wallet_Setup_Screen", {}, Date.now())
        DdRum.addAction(RumActionType.TAP, "SELECT_WALLET_IMPORT_WALLET") // Log specific user action
        DdRum.stopView("Wallet_Setup_Screen")
        track(AnalyticsEvent.SELECT_WALLET_IMPORT_WALLET)
        onOpen()
    }, [onOpen, track])

    const onObserveWallet = useCallback(async () => {
        DdRum.startView("Wallet_Setup_Screen", "Wallet_Setup_Screen", {}, Date.now())
        DdRum.addAction(RumActionType.TAP, "SELECT_WALLET_OBSERVE_WALLET") // Log specific user action
        DdRum.stopView("Wallet_Setup_Screen")
        track(AnalyticsEvent.SELECT_WALLET_OBSERVE_WALLET)
        nav.navigate(Routes.OBSERVE_WALLET)
    }, [nav, track])

    useEffect(() => {
        track(AnalyticsEvent.PAGE_LOADED_IMPORT_OR_CREATE)

        DdRum.startView("Wallet_Setup_Screen", "Wallet_Setup_Screen", {}, Date.now())
        DdRum.addAction(RumActionType.SCROLL, "PAGE_LOADED_IMPORT_OR_CREATE") // Log specific user action
        DdRum.stopView("Wallet_Setup_Screen")
    }, [track])

    return (
        <Layout
            body={
                <BaseView alignItems="center" justifyContent="space-between" flexGrow={1}>
                    <BaseView alignSelf="flex-start" w={100}>
                        <BaseText typographyFont="title" testID="wallet-setup-title-id">
                            {LL.TITLE_CREATE_WALLET_TYPE()}
                        </BaseText>
                        <BaseText typographyFont="body" my={10}>
                            {LL.BD_CREATE_WALLET_TYPE()}
                        </BaseText>
                        <BaseSpacer height={48} />
                        <WalletSetupSvg width={"100%"} />
                    </BaseView>
                </BaseView>
            }
            footer={
                <BaseView>
                    <BaseView alignItems="center" w={100}>
                        <BaseTouchableBox action={createLocalWallet} py={16} haptics="Medium">
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
                        <BaseTouchableBox
                            haptics="Medium"
                            action={onImportWallet}
                            py={16}
                            justifyContent="space-between">
                            <BaseIcon name="tray-arrow-up" size={24} color={theme.colors.text} />
                            <BaseView flex={1} px={12}>
                                <BaseText align="left" typographyFont="subSubTitle">
                                    {LL.BTN_CREATE_WALLET_TYPE_IMPORT()}
                                </BaseText>
                                <BaseText align="left" pt={4} typographyFont="captionRegular">
                                    {LL.BTN_CREATE_WALLET_TYPE_IMPORT_SUBTITLE()}
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
                    </BaseView>

                    <ImportWalletBottomSheet ref={ref} onClose={onClose} />
                </BaseView>
            }
        />
    )
}
