import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseText, BaseView, Layout } from "~Components"
import { useWalletStatus } from "~Components/Providers/EncryptedStorageProvider/ApplicationSecurityProvider"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType, SCREEN_HEIGHT, SCREEN_WIDTH } from "~Constants"
import { DEVICE_TYPE, SmartWalletDevice, WALLET_STATUS } from "~Model"
import { PlatformUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { SocialProvider } from "~VechainWalletKit/types/wallet"

export const SmartWalletAuthGate = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const walletStatus = useWalletStatus()
    const { login, isAuthenticated, isReady } = useSmartWallet()
    const { onSetSelectedAccount } = useSetSelectedAccount()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const isSmartAccount = selectedAccount?.device?.type === DEVICE_TYPE.SMART_WALLET
    const smartDevice = isSmartAccount ? (selectedAccount.device as SmartWalletDevice) : null
    const linkedProviders: SocialProvider[] = smartDevice?.linkedProviders || []
    const accountName = smartDevice?.accountName

    const needsAuth = walletStatus === WALLET_STATUS.UNLOCKED && isSmartAccount && isReady && !isAuthenticated

    const alternativeWallets = useMemo(
        () => visibleAccounts.filter(account => account.device.type !== DEVICE_TYPE.SMART_WALLET),
        [visibleAccounts],
    )
    const hasAlternativeWallets = alternativeWallets.length > 0
    const alternativeWalletAddress = alternativeWallets[0]?.address

    const handleProviderLogin = useCallback(
        async (provider: SocialProvider) => {
            await login({ provider, oauthRedirectUri: "/auth/callback" })
        },
        [login],
    )

    const handleSwitchToAlternativeWallet = useCallback(() => {
        if (alternativeWalletAddress) {
            onSetSelectedAccount({ address: alternativeWalletAddress })
        }
    }, [alternativeWalletAddress, onSetSelectedAccount])

    // Fallback: show both buttons if no providers stored (legacy accounts)
    const showGoogle = linkedProviders.length === 0 || linkedProviders.includes("google")
    const showApple = (linkedProviders.length === 0 || linkedProviders.includes("apple")) && PlatformUtils.isIOS()

    if (!needsAuth) return null

    return (
        <BaseView style={styles.overlay}>
            <Layout
                noBackButton
                title={LL.SMART_WALLET_REAUTH_TITLE()}
                fixedBody={
                    <BaseView style={styles.contentContainer}>
                        <BaseText typographyFont="bodyMedium" color={theme.colors.text} align="center">
                            {accountName
                                ? LL.SMART_WALLET_REAUTH_DESCRIPTION()
                                : LL.SMART_WALLET_REAUTH_DESCRIPTION_GENERIC()}
                        </BaseText>

                        <BaseView gap={16} w={100}>
                            {showApple && (
                                <BaseButton
                                    testID="RELOGIN_APPLE_BUTTON"
                                    style={styles.socialButton}
                                    leftIcon={
                                        <BaseIcon color={theme.colors.buttonText} name="icon-apple" size={24} />
                                    }
                                    textProps={{ typographyFont: "bodyMedium" }}
                                    title={LL.BTN_CONTINUE_WITH_APPLE()}
                                    action={() => handleProviderLogin("apple")}
                                />
                            )}

                            {showGoogle && (
                                <BaseButton
                                    testID="RELOGIN_GOOGLE_BUTTON"
                                    style={styles.socialButton}
                                    leftIcon={
                                        <BaseIcon color={theme.colors.buttonText} name="icon-google" size={24} />
                                    }
                                    textProps={{ typographyFont: "bodyMedium" }}
                                    title={LL.BTN_CONTINUE_WITH_GOOGLE()}
                                    action={() => handleProviderLogin("google")}
                                />
                            )}

                            {hasAlternativeWallets && (
                                <>
                                    <BaseText align="center" typographyFont="captionMedium">
                                        {LL.COMMON_OR()}
                                    </BaseText>
                                    <BaseButton
                                        variant="outline"
                                        title={LL.SMART_WALLET_REAUTH_SWITCH_WALLET()}
                                        textProps={{ typographyFont: "bodyMedium" }}
                                        action={handleSwitchToAlternativeWallet}
                                        testID="RELOGIN_SWITCH_WALLET_BUTTON"
                                    />
                                </>
                            )}
                        </BaseView>
                    </BaseView>
                }
            />
        </BaseView>
    )
}

const baseStyles = (_theme: ColorThemeType) =>
    StyleSheet.create({
        overlay: {
            position: "absolute",
            top: 0,
            left: 0,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT * 1.1,
            zIndex: 1,
            backgroundColor: _theme.colors.background,
        },
        contentContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            paddingHorizontal: 24,
        },
        socialButton: {
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
        },
    })
