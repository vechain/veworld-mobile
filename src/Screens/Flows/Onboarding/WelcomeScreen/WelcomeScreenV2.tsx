import { StyleSheet } from "react-native"
import React from "react"
import { BaseButton, BaseIcon, BaseSafeArea, BaseText, BaseView } from "~Components/Base"
import { VeWorldLogoV2 } from "~Assets/Img"
import { useThemedStyles } from "~Hooks/useTheme"
import { COLORS, ColorThemeType } from "~Constants"
import { PlatformUtils } from "~Utils"
import Markdown from "react-native-markdown-display"

export const WelcomeScreenV2 = () => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const termsOfServiceUrl = process.env.REACT_APP_TERMS_OF_SERVICE_URL
    const privacyPolicyUrl = process.env.REACT_APP_PRIVACY_POLICY_URL

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
                                title="Continue with Apple"
                                action={() => {}}
                            />
                        )}
                        <BaseButton
                            testID="GOOGLE_LOGIN_BUTTON"
                            style={styles.socialButton}
                            leftIcon={<BaseIcon color={theme.colors.buttonText} name="icon-google" size={24} />}
                            textProps={{ typographyFont: "bodyMedium" }}
                            title="Continue with Google"
                            action={() => {}}
                        />
                        <BaseText align="center" typographyFont="captionMedium">
                            {"Or"}
                        </BaseText>
                        <BaseButton
                            testID="SELF_CUSTODY_WALLET_BUTTON"
                            variant="outline"
                            title="Self-custody wallet"
                            textProps={{ typographyFont: "bodyMedium" }}
                            action={() => {}}
                        />
                    </BaseView>
                    <BaseView mx={64} alignItems="center">
                        <Markdown
                            style={{
                                paragraph: styles.markdown,
                            }}>
                            {`By using VeWorld’s wallet, the user accepts [Terms and Conditions](${
                                termsOfServiceUrl ?? ""
                            }) and [Privacy Policy](${privacyPolicyUrl ?? ""}).`}
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
