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

export const WelcomeScreenV2 = () => {
    const termsOfServiceUrl = process.env.REACT_APP_TERMS_OF_SERVICE_URL
    const privacyPolicyUrl = process.env.REACT_APP_PRIVACY_POLICY_URL

    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL, setLocale } = useI18nContext()

    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

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
        <BaseSafeArea>
            <BaseView flex={1} gap={16} p={24} justifyContent="space-between">
                {/* Header */}
                <BaseView flexDirection="row" justifyContent="center" alignItems="center">
                    <VeWorldLogoV2 color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE} />
                </BaseView>
                {/* Body */}
                <BaseView flex={1} style={styles.bodyContainer} bg="darkblue" />
                {/* Footer */}
                <BaseView gap={16} justifyContent="flex-end">
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
                            action={() => {}}
                        />
                    </BaseView>
                    <BaseView mx={64} alignItems="center">
                        <Markdown
                            style={{
                                paragraph: styles.markdown,
                            }}>
                            {LL.COMMON_LBL_BY_AGREEMENT({
                                termsOfServiceUrl: termsOfServiceUrl ?? "",
                                privacyPolicyUrl: privacyPolicyUrl ?? "",
                            })}
                        </Markdown>
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        bodyContainer: {
            maxHeight: 380,
            height: "100%",
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
