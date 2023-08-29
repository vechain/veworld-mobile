import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect } from "react"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    Layout,
} from "~Components"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useBottomSheetModal, useTheme } from "~Hooks"
import { ImportWalletBottomSheet } from "./components"
import { WalletSetupSvg } from "~Assets"
import { AnalyticsEvent } from "~Constants"
import { Linking } from "react-native"

export const WalletSetupScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const theme = useTheme()
    const track = useAnalyticTracking()

    const { ref, onOpen, onClose } = useBottomSheetModal()

    const onCreateWallet = useCallback(async () => {
        track(AnalyticsEvent.SELECT_WALLET_CREATE_WALLET)
        nav.navigate(Routes.NEW_MNEMONIC)
    }, [nav, track])

    const onImportWallet = useCallback(async () => {
        track(AnalyticsEvent.SELECT_WALLET_IMPORT_WALLET)
        onOpen()
    }, [onOpen, track])

    const goToTermsAndConditions = useCallback(() => {
        const url = process.env.REACT_APP_TERMS_OF_SERVICE_URL
        url && Linking.openURL(url)
    }, [])

    const goToPrivacyPolicy = useCallback(() => {
        const url = process.env.REACT_APP_PRIVACY_POLICY_URL
        url && Linking.openURL(url)
    }, [])

    useEffect(() => {
        track(AnalyticsEvent.PAGE_LOADED_IMPORT_OR_CREATE)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout
            body={
                <BaseView
                    alignItems="center"
                    justifyContent="space-between"
                    flexGrow={1}>
                    <BaseView alignSelf="flex-start" w={100}>
                        <BaseText
                            typographyFont="title"
                            testID="wallet-setup-title-id">
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
                        <BaseTouchableBox
                            action={onCreateWallet}
                            py={16}
                            haptics="Medium">
                            <BaseIcon
                                name="plus-circle"
                                size={24}
                                color={theme.colors.text}
                            />
                            <BaseView flex={1} px={12}>
                                <BaseText
                                    align="left"
                                    typographyFont="subSubTitle">
                                    {LL.BTN_CREATE_WALLET_TYPE_CREATE_NEW()}
                                </BaseText>
                                <BaseText
                                    pt={4}
                                    align="left"
                                    typographyFont="captionRegular">
                                    {LL.BTN_CREATE_WALLET_TYPE_CREATE_NEW_SUBTITLE()}
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
                            haptics="Medium"
                            action={onImportWallet}
                            py={16}
                            justifyContent="space-between">
                            <BaseIcon
                                name="tray-arrow-up"
                                size={24}
                                color={theme.colors.text}
                            />
                            <BaseView flex={1} px={12}>
                                <BaseText
                                    align="left"
                                    typographyFont="subSubTitle">
                                    {LL.BTN_CREATE_WALLET_TYPE_IMPORT()}
                                </BaseText>
                                <BaseText
                                    align="left"
                                    pt={4}
                                    typographyFont="captionRegular">
                                    {LL.BTN_CREATE_WALLET_TYPE_IMPORT_SUBTITLE()}
                                </BaseText>
                            </BaseView>
                            <BaseIcon
                                name="chevron-right"
                                size={24}
                                color={theme.colors.text}
                            />
                        </BaseTouchableBox>
                        <BaseSpacer height={24} />
                        <BaseView
                            alignSelf="center"
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                            flexWrap="wrap">
                            <BaseText typographyFont="body" align="center">
                                {LL.BD_CREATE_WALLET_TYPE_USER_ACCEPTS()}
                            </BaseText>
                            <BaseText
                                typographyFont="bodyMedium"
                                underline
                                align="center"
                                onPress={goToTermsAndConditions}>
                                {LL.COMMON_LBL_TERMS_AND_CONDITIONS()}
                            </BaseText>
                            <BaseText typographyFont="body" align="center">
                                {" "}
                                {LL.COMMON_LBL_AND()}{" "}
                            </BaseText>
                            <BaseText
                                typographyFont="bodyMedium"
                                underline
                                align="center"
                                onPress={goToPrivacyPolicy}>
                                {LL.COMMON_LBL_PRIVACY_POLICY()}
                            </BaseText>
                        </BaseView>
                    </BaseView>

                    <ImportWalletBottomSheet ref={ref} onClose={onClose} />
                </BaseView>
            }
        />
    )
}
