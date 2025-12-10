import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { Linking, Pressable, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useCloseBrowser } from "~Hooks/useCloseBrowser"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { Routes } from "~Navigation"
import { SelectNetworkBottomSheet } from "../../NetworkScreen/Components"

type DappNotVerifiedCardProps = {
    title: string
    subtitle: string
    onPress: () => void
    icon: IconKey
}

const DappNotVerifiedCard = ({ title, subtitle, onPress, icon }: DappNotVerifiedCardProps) => {
    const { styles, theme } = useThemedStyles(cardStyles)
    return (
        <Pressable style={styles.root} onPress={onPress}>
            <BaseView flex={1} gap={4}>
                <BaseText color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE} typographyFont="bodySemiBold">
                    {title}
                </BaseText>
                <BaseText color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} typographyFont="captionRegular">
                    {subtitle}
                </BaseText>
            </BaseView>
            <BaseIcon name={icon} size={16} color={COLORS.GREY_400} />
        </Pressable>
    )
}

const cardStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_50,
            borderWidth: 1,
            borderRadius: 12,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_100,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
        },
    })

type Props = {
    onNavigate: () => void | Promise<void>
    returnScreen?:
        | Routes.SETTINGS
        | Routes.HOME
        | Routes.ACTIVITY_STAKING
        | Routes.APPS
        | Routes.SWAP
        | Routes.COLLECTIBLES_COLLECTION_DETAILS
}

export const DappNotVerified = ({ returnScreen, onNavigate }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const navigateBack = useCloseBrowser({ returnScreen, onNavigate })

    const { ref: bsRef, onClose, onOpenPlain } = useBottomSheetModal()

    const onAppDeveloper = useCallback(() => {
        Linking.openURL("https://github.com/vechain/app-hub")
    }, [])

    const onAppTrusted = useCallback(async () => {
        await onNavigate()
        nav.navigate(Routes.SETTINGS_PRIVACY)
    }, [nav, onNavigate])

    return (
        <BaseView style={styles.root}>
            <BaseView flex={1} w={100} justifyContent="center" alignItems="center">
                <BaseIcon name="icon-alert-triangle" color={theme.isDark ? COLORS.RED_400 : COLORS.RED_600} size={40} />
                <BaseSpacer height={24} />
                <BaseText
                    typographyFont="subSubTitleSemiBold"
                    align="center"
                    color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}>
                    {LL.DAPP_NOT_VERIFIED_BROWSER_WARNING_TITLE()}
                </BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body" align="center" color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}>
                    {LL.DAPP_NOT_VERIFIED_BROWSER_WARNING_SUBTITLE()}
                </BaseText>
            </BaseView>

            <DappNotVerifiedCard
                icon="icon-arrow-link"
                onPress={onAppTrusted}
                title={LL.DAPP_TRUSTED_TITLE()}
                subtitle={LL.DAPP_TRUSTED_DESCRIPTION()}
            />
            <BaseSpacer height={8} />

            <DappNotVerifiedCard
                icon="icon-arrow-link"
                onPress={onAppDeveloper}
                title={LL.DAPP_OWNED_TITLE()}
                subtitle={LL.DAPP_OWNED_DESCRIPTION()}
            />
            <BaseSpacer height={24} />

            <BaseView flexDirection="row" gap={16}>
                <BaseButton variant="outline" action={navigateBack} flex={1}>
                    {LL.COMMON_LBL_CLOSE()}
                </BaseButton>
                <BaseButton variant="solid" action={onOpenPlain} flex={1}>
                    {LL.DAPP_NOT_VERIFIED_SWITCH_NETWORK()}
                </BaseButton>
            </BaseView>

            <SelectNetworkBottomSheet ref={bsRef} onClose={onClose} />
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flex: 1,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingVertical: 40,
            backgroundColor: theme.colors.card,
        },
    })
