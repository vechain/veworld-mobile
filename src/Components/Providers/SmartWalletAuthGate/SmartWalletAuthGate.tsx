import React, { useCallback, useMemo } from "react"
import { SectionList, SectionListData, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, InfoBottomSheet, Layout } from "~Components"
import { BaseSectionListSeparatorProps, SectionListSeparator } from "~Components/Reusable"
import { SelectableAccountCard } from "~Components/Reusable/SelectableAccountCard"
import { useWalletStatus } from "~Components/Providers/EncryptedStorageProvider/ApplicationSecurityProvider"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType, SCREEN_HEIGHT, SCREEN_WIDTH } from "~Constants"
import { AccountWithDevice, DEVICE_TYPE, SmartWalletDevice, WALLET_STATUS } from "~Model"
import { AddressUtils, PlatformUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { SocialProvider } from "~VechainWalletKit/types/wallet"

const PROVIDER_DISPLAY_NAMES: Record<SocialProvider, string> = {
    google: "Google",
    apple: "Apple",
    twitter: "Twitter",
}

const formatProvidersList = (providers: SocialProvider[], andWord: string): string => {
    const names = providers.map(p => PROVIDER_DISPLAY_NAMES[p])
    if (names.length <= 1) return names[0] ?? ""
    return `${names.slice(0, -1).join(", ")} ${andWord} ${names[names.length - 1]}`
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />
const SectionSeparatorComponent = (props: BaseSectionListSeparatorProps) => {
    return <SectionListSeparator {...props} headerToHeaderHeight={24} headerToItemsHeight={8} />
}

const SectionHeader = ({
    section,
}: {
    section: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
}) => {
    return <BaseText typographyFont="bodyMedium">{section.alias}</BaseText>
}

export const SmartWalletAuthGate = () => {
    const walletStatus = useWalletStatus()

    if (walletStatus === WALLET_STATUS.FIRST_TIME_ACCESS) return null

    return <SmartWalletAuthGateContent walletStatus={walletStatus} />
}

const SmartWalletAuthGateContent = ({ walletStatus }: { walletStatus: WALLET_STATUS }) => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const { login, isAuthenticated, isReady } = useSmartWallet()
    const { onSetSelectedAccount } = useSetSelectedAccount()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { ref: infoBsRef, onOpenPlain: openInfoBs } = useBottomSheetModal()

    const isSmartAccount = selectedAccount?.device?.type === DEVICE_TYPE.SMART_WALLET
    const smartDevice = isSmartAccount ? (selectedAccount.device as SmartWalletDevice) : null
    const linkedProviders: SocialProvider[] = smartDevice?.linkedProviders || []

    const needsAuth = walletStatus === WALLET_STATUS.UNLOCKED && isSmartAccount && isReady && !isAuthenticated

    const accountName = smartDevice?.accountName ?? selectedAccount?.alias ?? ""
    const addrShort = selectedAccount ? AddressUtils.humanAddress(selectedAccount.address) : ""
    const providersText = formatProvidersList(linkedProviders, LL.COMMON_AND())

    const subtitle =
        linkedProviders.length > 0
            ? LL.SMART_WALLET_REAUTH_DESCRIPTION({ name: accountName, address: addrShort, providers: providersText })
            : LL.SMART_WALLET_REAUTH_DESCRIPTION_NO_PROVIDERS({ name: accountName, address: addrShort })

    const alternativeWallets = useMemo(
        () => visibleAccounts.filter(account => account.device.type !== DEVICE_TYPE.SMART_WALLET),
        [visibleAccounts],
    )
    const hasAlternativeWallets = alternativeWallets.length > 0

    const sections = useMemo(() => {
        const groupedAccounts = alternativeWallets.reduce(
            (acc, curr) => {
                const key = curr.device?.alias ?? curr.alias
                return { ...acc, [key]: [...(acc[key] ?? []), curr] }
            },
            {} as { [alias: string]: AccountWithDevice[] },
        )
        return Object.entries(groupedAccounts).map(([alias, data]) => ({ alias, data }))
    }, [alternativeWallets])

    const handleProviderLogin = useCallback(
        async (provider: SocialProvider) => {
            await login({ provider, oauthRedirectUri: "/auth/callback" })
        },
        [login],
    )

    const handleSelectAccount = useCallback(
        (account: AccountWithDevice) => {
            onSetSelectedAccount({ address: account.address })
        },
        [onSetSelectedAccount],
    )

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
                        <BaseText
                            typographyFont="bodyMedium"
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                        >
                            {subtitle}
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
                            <BaseText
                                typographyFont="captionMedium"
                                underline
                                align="center"
                                color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                                onPress={openInfoBs}
                                testID="RELOGIN_WHY_SIGN_IN"
                            >
                                {LL.SMART_WALLET_REAUTH_WHY_SIGN_IN()}
                            </BaseText>
                        </BaseView>



                        {hasAlternativeWallets && (
                            <>
                                <BaseText align="center" typographyFont="captionMedium">
                                    {LL.COMMON_OR()}
                                </BaseText>

                                <BaseView style={styles.walletHeader}>
                                    <BaseView flexDirection="row" alignItems="center" gap={12}>
                                        <BaseIcon
                                            name="icon-wallet"
                                            size={20}
                                            color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_900}
                                        />
                                        <BaseText typographyFont="subTitleSemiBold">
                                            {LL.SMART_WALLET_REAUTH_SELF_CUSTODY_TITLE()}
                                        </BaseText>
                                    </BaseView>
                                    <BaseText
                                        typographyFont="body"
                                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}
                                    >
                                        {LL.SMART_WALLET_REAUTH_SELF_CUSTODY_DESCRIPTION()}
                                    </BaseText>
                                </BaseView>

                                <SectionList
                                    sections={sections}
                                    keyExtractor={item => item.address}
                                    renderSectionHeader={SectionHeader}
                                    stickySectionHeadersEnabled={false}
                                    renderItem={({ item }) => (
                                        <SelectableAccountCard
                                            account={item}
                                            onPress={handleSelectAccount}
                                            balanceToken="VET"
                                            testID="RELOGIN_ACCOUNT_CARD"
                                        />
                                    )}
                                    ItemSeparatorComponent={ItemSeparatorComponent}
                                    SectionSeparatorComponent={SectionSeparatorComponent}
                                    showsVerticalScrollIndicator={false}
                                    style={styles.list}
                                />
                            </>
                        )}

                        <InfoBottomSheet
                            bsRef={infoBsRef}
                            title={LL.SMART_WALLET_REAUTH_WHY_SIGN_IN()}
                            description={LL.SMART_WALLET_REAUTH_WHY_SIGN_IN_DESCRIPTION()}
                        />
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
            gap: 24,
            paddingHorizontal: 24,
            paddingTop: 16,
        },
        socialButton: {
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
        },
        walletHeader: {
            flexDirection: "column",
            gap: 8,
        },
        list: {
            flex: 1,
        },
    })
