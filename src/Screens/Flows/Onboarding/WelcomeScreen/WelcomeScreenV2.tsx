import { StyleSheet } from "react-native"
import React, { useCallback, useEffect } from "react"
import { BaseButton, BaseIcon, BaseSafeArea, BaseText, BaseView } from "~Components/Base"
import { VeWorldLogoV2 } from "~Assets/Img"
import { useThemedStyles } from "~Hooks/useTheme"
import { AnalyticsEvent, COLORS, ColorThemeType } from "~Constants"
import { PlatformUtils } from "~Utils"
import Markdown from "react-native-markdown-display"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import * as RNLocalize from "react-native-localize"
import { languages } from "~Model"
import { Locales, useI18nContext } from "~i18n"
import { setLanguage, useAppDispatch } from "~Storage/Redux"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { SelfCustodyOptionsBottomSheet } from "../Components"
import LottieView from "lottie-react-native"
import { OnboardingB3MO, OnboardingStardust } from "~Assets/Lottie"

export const WelcomeScreenV2 = () => {
    const termsOfServiceUrl = process.env.REACT_APP_TERMS_OF_SERVICE_URL
    const privacyPolicyUrl = process.env.REACT_APP_PRIVACY_POLICY_URL

    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL, setLocale } = useI18nContext()

    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const { ref: selfCustodyOptionsBottomSheetRef, onOpen: openSelfCustodyOptionsBottomSheet } = useBottomSheetModal()

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
        },
        [dispatch, setLocale],
    )

    useEffect(() => {
        // Track when a new onboarding start
        track(AnalyticsEvent.ONBOARDING_START)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const currentLanguageCode = getAllLanguageCodes()
        const newSelectedLanguageCode = languages.find(item => item.code === currentLanguageCode[0])
        handleSelectLanguage((newSelectedLanguageCode?.code as Locales) ?? "en")
    }, [getAllLanguageCodes, handleSelectLanguage])

    return (
        <BaseSafeArea testID="WELCOME_SCREEN_V2" style={styles.root}>
            <LottieView source={OnboardingStardust} autoPlay loop speed={1} style={styles.stardustBackground} />
            <BaseView flex={1} gap={16} p={24} justifyContent="space-between">
                {/* Header */}
                <BaseView flexDirection="row" justifyContent="center" alignItems="center" pb={30}>
                    <VeWorldLogoV2 color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE} />
                </BaseView>
                {/* Body */}
                <BaseView flex={1} style={styles.bodyContainer}>
                    <LottieView
                        testID="ONBOARDING_B3MO"
                        source={OnboardingB3MO}
                        autoPlay
                        loop
                        speed={0.4}
                        style={styles.onboardingB3MO}
                    />
                    <BaseView gap={8} alignItems="center">
                        <BaseText
                            testID="ONBOARDING_B3MO_TITLE"
                            typographyFont="subTitleSemiBold"
                            color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}>
                            {"Crypto, simplified."}
                        </BaseText>
                        <BaseText
                            testID="ONBOARDING_B3MO_DESCRIPTION"
                            typographyFont="bodyMedium"
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                            {"The easiest way to explore VeChain."}
                        </BaseText>
                    </BaseView>
                </BaseView>
                {/* Footer */}
                <BaseView gap={16} justifyContent="flex-end" flex={1}>
                    <BaseView gap={16}>
                        {PlatformUtils.isIOS() && (
                            <BaseButton
                                testID="APPLE_LOGIN_BUTTON"
                                style={styles.socialButton}
                                leftIcon={<BaseIcon color={theme.colors.buttonText} name="icon-apple" size={24} />}
                                textProps={{ typographyFont: "bodyMedium" }}
                                title={LL.BTN_CONTINUE_WITH_APPLE()}
                                action={() => {}}
                            />
                        )}
                        <BaseButton
                            testID="GOOGLE_LOGIN_BUTTON"
                            style={styles.socialButton}
                            leftIcon={<BaseIcon color={theme.colors.buttonText} name="icon-google" size={24} />}
                            textProps={{ typographyFont: "bodyMedium" }}
                            title={LL.BTN_CONTINUE_WITH_GOOGLE()}
                            action={() => {}}
                        />
                        <BaseText align="center" typographyFont="captionMedium">
                            {LL.COMMON_OR()}
                        </BaseText>
                        <BaseButton
                            testID="SELF_CUSTODY_WALLET_BUTTON"
                            variant="outline"
                            title={LL.BTN_SELF_CUSTODY_WALLET()}
                            textProps={{ typographyFont: "bodyMedium" }}
                            action={openSelfCustodyOptionsBottomSheet}
                        />
                    </BaseView>
                    <BaseView alignItems="center">
                        <Markdown
                            style={{
                                body: styles.markdown,
                            }}>
                            {LL.COMMON_LBL_BY_AGREEMENT({
                                termsOfServiceUrl: termsOfServiceUrl ?? "",
                                privacyPolicyUrl: privacyPolicyUrl ?? "",
                            })}
                        </Markdown>
                    </BaseView>
                </BaseView>
            </BaseView>
            <SelfCustodyOptionsBottomSheet bsRef={selfCustodyOptionsBottomSheetRef} />
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            position: "relative",
        },
        stardustBackground: {
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.5,
        },
        onboardingB3MO: {
            width: 350,
            height: 350,
        },
        bodyContainer: {
            alignItems: "center",
            justifyContent: "center",
        },
        socialButton: {
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
        },
        markdown: {
            textAlign: "center",
            color: theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED,
            fontSize: 10,
            fontFamily: "Inter-Regular",
            fontWeight: "400",
            lineHeight: 14,
            padding: 0,
            margin: 0,
        },
    })
