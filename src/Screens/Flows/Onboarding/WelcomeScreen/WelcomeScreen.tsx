import { useFocusEffect, useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useState } from "react"
import { ImageBackground, Linking, Modal, StyleSheet, View } from "react-native"
import DropShadow from "react-native-drop-shadow"
import LinearGradient from "react-native-linear-gradient"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import { VeWorldLogoSVG } from "~Assets"
import {
    BackButtonHeader,
    BaseButton,
    BaseIcon,
    BaseModal,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseView,
    ImportWalletBottomSheet,
    Layout,
} from "~Components"
import { AnalyticsEvent, COLORS, DerivationPath, SCREEN_HEIGHT, SCREEN_WIDTH } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useCloudBackup, useDisclosure, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { UserCreatePasswordScreen } from "~Screens/Flows/WalletCreation"
import { PlatformUtils } from "~Utils"
import { useDemoWallet } from "./useDemoWallet"
import { useHandleWalletCreation } from "./useHandleWalletCreation"

import { Routes } from "~Navigation"
import { CloudKitWallet, DrivetWallet } from "~Model"
const assetImage = require("~Assets/Img/Clouds.png")

export const WelcomeScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()
    const track = useAnalyticTracking()

    const { ref, onOpen, onClose } = useBottomSheetModal()

    const [isLoading, setIsLoading] = useState(false)
    const [wallets, setWallets] = useState<CloudKitWallet[] | DrivetWallet[]>([])

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

    const DEV_DEMO_BUTTON = useDemoWallet()
    const { onCreateWallet, isOpen, isError, onSuccess, onClose: onCloseCreateFlow } = useHandleWalletCreation()

    const onGoToImportFromCLoud = useCallback(() => {
        onQuickCloudModalClose()
        nav.navigate(Routes.IMPORT_FROM_CLOUD, { wallets })
    }, [nav, onQuickCloudModalClose, wallets])

    return (
        <>
            <Layout
                noBackButton
                fixedBody={
                    <BaseView alignItems="center" flex={1} mx={24}>
                        <BaseView flexDirection="row" mt={20}>
                            <BaseText typographyFont="largeTitle" testID="welcome-title-id">
                                {LL.TITLE_WELCOME_TO()}
                            </BaseText>
                            <BaseText typographyFont="largeTitle">{LL.VEWORLD()}</BaseText>
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
                            action={() => onCreateWallet({ derivationPath: DerivationPath.VET })}
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
                                {LL.COMMON_LBL_AND()}
                            </BaseText>
                            <BaseText typographyFont="bodyMedium" underline align="center" onPress={goToPrivacyPolicy}>
                                {LL.COMMON_LBL_PRIVACY_POLICY()}
                            </BaseText>
                        </BaseView>

                        {DEV_DEMO_BUTTON}
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
                    <LinearGradient colors={theme.colors.gradientBackground} style={s.gradient}>
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

            <BaseModal isOpen={isOpen} onClose={onCloseCreateFlow}>
                <BaseView justifyContent="flex-start">
                    <BackButtonHeader action={onCloseCreateFlow} hasBottomSpacer={false} />
                    <UserCreatePasswordScreen
                        onSuccess={pin => onSuccess({ pin, derivationPath: DerivationPath.VET })}
                    />
                </BaseView>
            </BaseModal>
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

    return (
        <View style={s.gradient}>
            <DropShadow style={[theme.shadows.card]}>
                <View style={s.imageContainer}>
                    <ImageBackground source={assetImage} resizeMode="cover" style={s.bgImage}>
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
                                        name={PlatformUtils.isIOS() ? "apple-icloud" : "google-drive"}
                                        size={22}
                                        color={theme.isDark ? theme.colors.text : theme.colors.textReversed}
                                        style={s.icon}
                                    />
                                }
                                style={s.centerButtonContent}
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

const s = StyleSheet.create({
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
})
