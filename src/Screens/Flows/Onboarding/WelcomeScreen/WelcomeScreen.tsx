import { useFocusEffect, useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ImageBackground, Linking, Modal, StyleSheet, View } from "react-native"
import DropShadow from "react-native-drop-shadow"
import LinearGradient from "react-native-linear-gradient"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import { VeWorldLogoSVG } from "~Assets"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseView,
    CreatePasswordModal,
    ImportWalletBottomSheet,
    Layout,
    SelectLanguageBottomSheet,
} from "~Components"
import { AnalyticsEvent, COLORS, DerivationPath, SCREEN_HEIGHT, SCREEN_WIDTH } from "~Constants"
import {
    useAnalyticTracking,
    useBottomSheetModal,
    useCloudBackup,
    useDisclosure,
    useTheme,
    useThemedStyles,
} from "~Hooks"
import { Locales, useI18nContext } from "~i18n"
import { useDemoWallet } from "./useDemoWallet"
import { useHandleWalletCreation } from "./useHandleWalletCreation"

import * as RNLocalize from "react-native-localize"
import { CloudKitWallet, DrivetWallet, languages } from "~Model"
import { Routes } from "~Navigation"
import { selectLanguage, setLanguage, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
const assetImage = require("~Assets/Img/Clouds.png")

export const WelcomeScreen = () => {
    const { LL, setLocale } = useI18nContext()
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyle)
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()

    const { ref, onOpen, onClose } = useBottomSheetModal()

    const selectedLanguageCode = useAppSelector(selectLanguage)

    const {
        ref: selectLanguageSheetRef,
        onOpen: openSelectLanguageSheet,
        onClose: closeSelectLanguageSheet,
    } = useBottomSheetModal()

    const [isLoading, setIsLoading] = useState(false)
    const [wallets, setWallets] = useState<CloudKitWallet[] | DrivetWallet[]>([])

    const getAllLanguageCodes = useCallback(() => {
        const locales = RNLocalize.getLocales()
        const languageCodes = locales.map(locale => locale.languageCode)
        const uniqueLanguageCodes = Array.from(new Set(languageCodes)) // Remove duplicates
        return uniqueLanguageCodes
    }, [])

    const handleSelectLanguage = useCallback(
        (language: Locales) => {
            dispatch(setLanguage(language))
            setLocale(language)
            closeSelectLanguageSheet()
        },
        [closeSelectLanguageSheet, dispatch, setLocale],
    )

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

    const { getAllWalletFromCloud, isCloudAvailable } = useCloudBackup()

    const {
        onOpen: onQuickCloudModalOpen,
        onClose: onQuickCloudModalClose,
        isOpen: isQuickCloudModalOpen,
    } = useDisclosure()

    const [walletNumber, setWalletNumber] = useState(0)

    useFocusEffect(
        useCallback(() => {
            const init = async () => {
                setIsLoading(true)
                const _wallets = await getAllWalletFromCloud()
                setWalletNumber(_wallets.length)
                setWallets(_wallets)
                setIsLoading(false)
                if (_wallets.length) {
                    onQuickCloudModalOpen()
                }
            }

            isCloudAvailable && PlatformUtils.isIOS() && init()
        }, [onQuickCloudModalOpen, isCloudAvailable, getAllWalletFromCloud]),
    )

    useEffect(() => {
        // Track when a new onboarding start
        track(AnalyticsEvent.ONBOARDING_START)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const isDefaultLanguage = selectedLanguageCode === "en"

        if (isDefaultLanguage) {
            const currentLanguageCode = getAllLanguageCodes()
            const newSelectedLanguageCode = languages.find(item => item.code === currentLanguageCode[0])
            handleSelectLanguage((newSelectedLanguageCode?.code as Locales) ?? "en")
        }
    }, [getAllLanguageCodes, handleSelectLanguage, selectedLanguageCode])

    const DEV_DEMO_BUTTON = useDemoWallet()
    const { onCreateWallet, isOpen, isError, onSuccess, onClose: onCloseCreateFlow } = useHandleWalletCreation()

    const onNewWallet = useCallback(async () => {
        await onCreateWallet({ derivationPath: DerivationPath.VET })
    }, [onCreateWallet])

    const onGoToImportFromCLoud = useCallback(() => {
        onQuickCloudModalClose()
        nav.navigate(Routes.IMPORT_FROM_CLOUD, { wallets })
    }, [nav, onQuickCloudModalClose, wallets])

    const selectedLanguageName = useMemo(
        () =>
            languages
                .find(_language => _language.code === selectedLanguageCode)
                ?.name.substring(0, 3)
                .toUpperCase(),
        [selectedLanguageCode],
    )

    return (
        <>
            <Layout
                noBackButton
                fixedBody={
                    <BaseView alignItems="center" flex={1} px={24}>
                        <BaseView flexDirection="row" mt={20}>
                            <BaseText typographyFont="largeTitle" testID="welcome-title-id" style={styles.title}>
                                {`${LL.TITLE_WELCOME_TO()} ${LL.VEWORLD()}`}
                            </BaseText>
                        </BaseView>

                        <BaseView alignItems="center" w={100}>
                            <BaseText align="center" typographyFont="buttonSecondary" py={20}>
                                {LL.BD_WELCOME_SCREEN()}
                            </BaseText>
                        </BaseView>

                        <VeWorldLogoSVG height={240} width={240} />
                    </BaseView>
                }
                footer={
                    <BaseView alignItems="center" w={100}>
                        {!!isError && (
                            <BaseText my={10} color={theme.colors.danger}>
                                {isError}
                            </BaseText>
                        )}

                        <BaseButton
                            action={() => onNewWallet()}
                            w={100}
                            title={LL.BTN_CREATE_WALLET()}
                            testID="CREATE_WALLET_BTN"
                            haptics="Medium"
                            isLoading={isLoading}
                        />

                        <BaseSpacer height={12} />

                        <BaseButton
                            action={onImportWallet}
                            w={100}
                            variant="ghost"
                            title={LL.BTN_IMPORT_WALLET()}
                            testID="IMPORT_WALLET_BTN"
                            haptics="Medium"
                            isLoading={isLoading}
                        />

                        <BaseSpacer height={42} />

                        <BaseView flexDirection="row" justifyContent="space-between">
                            <BaseView
                                alignSelf="center"
                                flexDirection="row"
                                flex={1}
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
                                    {` ${LL.COMMON_LBL_AND()} `}
                                </BaseText>
                                <BaseText
                                    typographyFont="bodyMedium"
                                    underline
                                    align="center"
                                    onPress={goToPrivacyPolicy}>
                                    {LL.COMMON_LBL_PRIVACY_POLICY()}
                                </BaseText>
                            </BaseView>

                            <BaseButton
                                variant="outline"
                                size="sm"
                                action={openSelectLanguageSheet}
                                title={selectedLanguageName}
                                typographyFont="bodyMedium"
                                rightIcon={
                                    <BaseIcon name={"icon-chevron-down"} color={theme.colors.button} size={24} />
                                }
                            />
                        </BaseView>

                        <BaseSpacer height={12} />

                        <BaseView>{DEV_DEMO_BUTTON}</BaseView>
                    </BaseView>
                }
            />

            <Modal animationType="fade" transparent={true} visible={isQuickCloudModalOpen}>
                <BaseTouchable
                    action={onQuickCloudModalClose}
                    style={{
                        height: SCREEN_HEIGHT,
                        width: SCREEN_WIDTH,
                    }}>
                    <LinearGradient colors={theme.colors.gradientBackground} style={styles.gradient}>
                        <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
                            <CloudKitModalReminder
                                walletNumber={walletNumber}
                                onQuickCloudModalClose={onQuickCloudModalClose}
                                onGoToImportFromCLoud={onGoToImportFromCLoud}
                            />
                        </Animated.View>
                    </LinearGradient>
                </BaseTouchable>
            </Modal>

            <ImportWalletBottomSheet ref={ref} onClose={onClose} />

            <CreatePasswordModal
                isOpen={isOpen}
                onClose={onCloseCreateFlow}
                onSuccess={pin =>
                    onSuccess({
                        pin,
                        derivationPath: DerivationPath.VET,
                    })
                }
            />

            <SelectLanguageBottomSheet
                ref={selectLanguageSheetRef}
                selectedLanguage={selectedLanguageCode}
                handleSelectLanguage={handleSelectLanguage}
            />
        </>
    )
}

const CloudKitModalReminder = ({
    onQuickCloudModalClose,
    onGoToImportFromCLoud,
    walletNumber,
}: {
    onQuickCloudModalClose: () => void
    onGoToImportFromCLoud: () => void
    walletNumber: number
}) => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyle)

    return (
        <View style={styles.gradient}>
            <DropShadow style={[theme.shadows.card]}>
                <View style={styles.imageContainer}>
                    <ImageBackground source={assetImage} resizeMode="cover" style={styles.bgImage}>
                        <BaseView justifyContent="space-between" alignItems="center" flex={1} w={100} p={24} pt={42}>
                            <BaseView w={100} flex={1}>
                                <BaseText typographyFont="hugeTitle" align="center" color={COLORS.DARK_PURPLE}>
                                    {LL.WELCOME_BACK()}
                                </BaseText>

                                <BaseSpacer height={12} />

                                <BaseView flexDirection="row" w={100} justifyContent="center">
                                    <BaseText typographyFont="subSubTitle" align="center" color={COLORS.DARK_PURPLE}>
                                        {LL.WE_FOUND()}
                                    </BaseText>

                                    <BaseText typographyFont="title" align="center" color={COLORS.MEDIUM_GREEN}>
                                        {`${walletNumber} `}
                                    </BaseText>

                                    <BaseText typographyFont="subSubTitle" align="center" color={COLORS.DARK_PURPLE}>
                                        {PlatformUtils.isIOS()
                                            ? LL.WALLETS_SAVED_ON_ICLOUD()
                                            : LL.WALLETS_SAVED_ON_DRIVE()}
                                    </BaseText>
                                </BaseView>

                                <BaseSpacer height={12} />

                                <BaseView w={100}>
                                    <BaseView flexDirection="row" w={100} justifyContent="center" alignItems="center">
                                        <BaseText typographyFont="body" align="center" color={COLORS.DARK_PURPLE}>
                                            {LL.WOULD_YOU_LIKE_TO()}
                                        </BaseText>

                                        <BaseText typographyFont="bodyBold" align="center" color={COLORS.DARK_PURPLE}>
                                            {LL.RESTORE()}
                                        </BaseText>

                                        <BaseText typographyFont="body" align="center" color={COLORS.DARK_PURPLE}>
                                            {LL.THEM()}
                                        </BaseText>
                                    </BaseView>

                                    <BaseSpacer height={72} />
                                </BaseView>
                            </BaseView>

                            <BaseButton
                                title={PlatformUtils.isIOS() ? LL.TAKE_ME_TO_ICLOUD() : LL.TAKE_ME_TO_DRIVE()}
                                action={onGoToImportFromCLoud}
                                w={100}
                                bgColor={theme.isDark ? theme.colors.background : undefined}
                                textColor={theme.isDark ? theme.colors.text : undefined}
                                rightIcon={
                                    <BaseIcon
                                        name={PlatformUtils.isIOS() ? "icon-cloud" : "icon-google-drive"}
                                        size={22}
                                        color={theme.isDark ? theme.colors.text : theme.colors.textReversed}
                                        style={styles.icon}
                                    />
                                }
                                style={styles.centerButtonContent}
                            />

                            <BaseSpacer height={12} />

                            <BaseButton
                                title={LL.NO_THANKS()}
                                action={onQuickCloudModalClose}
                                w={100}
                                variant="ghost"
                                textColor={COLORS.DARK_PURPLE}
                            />
                        </BaseView>
                    </ImageBackground>
                </View>
            </DropShadow>
        </View>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        gradient: {
            height: SCREEN_HEIGHT,
            width: SCREEN_WIDTH,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        imageContainer: {
            borderRadius: 20,
            overflow: "hidden",
        },
        bgImage: {
            height: SCREEN_HEIGHT / 2,
            width: SCREEN_WIDTH - 24,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 16,
        },
        icon: {
            marginLeft: 6,
        },
        centerButtonContent: {
            justifyContent: "center",
            alignItems: "center",
        },
        title: {
            textAlign: "center",
        },
    })
