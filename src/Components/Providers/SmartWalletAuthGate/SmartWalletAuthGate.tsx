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
import { PlatformUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { SocialProvider } from "~VechainWalletKit/types/wallet"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FeedbackSeverity, FeedbackType } from "../FeedbackProvider/Model"
import { Feedback } from "../FeedbackProvider/Events"

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
    const { login, isAuthenticated, isReady } = useSmartWallet()
    const { onSetSelectedAccount } = useSetSelectedAccount()
    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const safeAreaInset = useSafeAreaInsets()
    const { LL } = useI18nContext()
    const { ref: infoBsRef, onOpenPlain: openInfoBs } = useBottomSheetModal()

    const isSmartAccount = selectedAccount?.device?.type === DEVICE_TYPE.SMART_WALLET

    const alternativeWallets = useMemo(
        () => visibleAccounts.filter(account => account.device.type !== DEVICE_TYPE.SMART_WALLET),
        [visibleAccounts],
    )

    const hasAlternativeWallets = alternativeWallets.length > 0
    const { styles, theme } = useThemedStyles(baseStyles(hasAlternativeWallets, safeAreaInset.bottom))

    const sections = useMemo(() => {
        const groupedAccounts = alternativeWallets.reduce((acc, curr) => {
            const key = curr.device?.alias ?? curr.alias
            return { ...acc, [key]: [...(acc[key] ?? []), curr] }
        }, {} as { [alias: string]: AccountWithDevice[] })
        return Object.entries(groupedAccounts).map(([alias, data]) => ({ alias, data }))
    }, [alternativeWallets])

    const handleProviderLogin = useCallback(
        async (provider: SocialProvider) => {
            try {
                await login({ provider, oauthRedirectUri: "/auth/callback" })
            } catch (e) {
                Feedback.show({
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                    message: LL.SMART_WALLET_LOGIN_FAILED(),
                    icon: "icon-alert-circle",
                })
            }
        },
        [login, LL],
    )

    const handleSelectAccount = useCallback(
        (account: AccountWithDevice) => {
            onSetSelectedAccount({ address: account.address })
        },
        [onSetSelectedAccount],
    )

    const needsAuth = walletStatus === WALLET_STATUS.UNLOCKED && isSmartAccount && isReady && !isAuthenticated
    if (!needsAuth) return null
    const smartDevice = isSmartAccount ? (selectedAccount.device as SmartWalletDevice) : null
    const linkedProviders: SocialProvider[] = smartDevice?.linkedProviders || []

    // Fallback: show both buttons if no providers stored
    const showGoogle = linkedProviders.length === 0 || linkedProviders.includes("google")
    const showApple = (linkedProviders.length === 0 || linkedProviders.includes("apple")) && PlatformUtils.isIOS()

    return (
        <BaseView style={styles.overlay}>
            <Layout
                headerRightElement={
                    <BaseIcon
                        name="icon-info"
                        size={20}
                        color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                        action={openInfoBs}
                    />
                }
                noBackButton
                hasSafeArea={true}
                title={LL.SMART_WALLET_REAUTH_TITLE()}
                fixedBody={
                    <BaseView style={styles.contentContainer}>
                        <BaseView gap={24}>
                            <BaseIcon
                                name="icon-log-in"
                                size={48}
                                color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.PURPLE}
                            />
                            <BaseText
                                typographyFont="bodyMedium"
                                align="center"
                                color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                                {LL.SMART_WALLET_REAUTH_DESCRIPTION()}
                            </BaseText>

                            <SelectableAccountCard
                                account={selectedAccount}
                                disabled
                                balanceToken="FIAT"
                                testID="RELOGIN_SMART_ACCOUNT_CARD"
                            />
                        </BaseView>

                        <BaseView gap={16} w={100}>
                            {showApple && (
                                <BaseButton
                                    testID="RELOGIN_APPLE_BUTTON"
                                    style={styles.socialButton}
                                    leftIcon={<BaseIcon color={theme.colors.buttonText} name="icon-apple" size={24} />}
                                    textProps={{ typographyFont: "bodyMedium" }}
                                    title={LL.BTN_CONTINUE_WITH_APPLE()}
                                    action={() => handleProviderLogin("apple")}
                                />
                            )}

                            {showGoogle && (
                                <BaseButton
                                    testID="RELOGIN_GOOGLE_BUTTON"
                                    style={styles.socialButton}
                                    leftIcon={<BaseIcon color={theme.colors.buttonText} name="icon-google" size={24} />}
                                    textProps={{ typographyFont: "bodyMedium" }}
                                    title={LL.BTN_CONTINUE_WITH_GOOGLE()}
                                    action={() => handleProviderLogin("google")}
                                />
                            )}
                        </BaseView>
                        {hasAlternativeWallets && (
                            <BaseView gap={16} flex={1}>
                                <BaseText
                                    align="center"
                                    typographyFont="captionMedium"
                                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}>
                                    {LL.COMMON_OR()}
                                </BaseText>

                                <BaseView style={styles.walletHeader}>
                                    <BaseText typographyFont="subSubTitleSemiBold">
                                        {LL.SMART_WALLET_REAUTH_SELF_CUSTODY_TITLE()}
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
                                            balanceToken="FIAT"
                                            testID="RELOGIN_ACCOUNT_CARD"
                                        />
                                    )}
                                    ItemSeparatorComponent={ItemSeparatorComponent}
                                    SectionSeparatorComponent={SectionSeparatorComponent}
                                    showsVerticalScrollIndicator={false}
                                    style={styles.list}
                                />
                            </BaseView>
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

const baseStyles = (hasAlternativeWallets: boolean, bottomInset: number) => (_theme: ColorThemeType) =>
    StyleSheet.create({
        overlay: {
            position: "absolute",
            top: 0,
            left: 0,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            zIndex: 1,
            backgroundColor: _theme.colors.background,
        },
        contentContainer: {
            flex: 1,
            gap: 24,
            paddingHorizontal: 24,
            paddingTop: 16,
            justifyContent: "space-between",
            paddingBottom: hasAlternativeWallets ? 0 : bottomInset,
        },
        socialButton: {
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
        },
        walletHeader: {
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
        },
        list: {
            flex: 1,
        },
    })
