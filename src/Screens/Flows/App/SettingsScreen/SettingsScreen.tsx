import React, { useCallback, useMemo, useRef } from "react"
import {
    BaseButton,
    BaseCard,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    SelectedNetworkViewer,
} from "~Components"
import { TranslationFunctions, useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { StyleSheet } from "react-native"
import { RowProps, SettingsRow } from "./Components/SettingsRow"
import { useCheckWalletBackup, useTheme, useThemedStyles } from "~Hooks"
import { ColorThemeType, isSmallScreen } from "~Constants"
import { selectAreDevFeaturesEnabled, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { useNavigation, useScrollToTop } from "@react-navigation/native"
import { FlatList } from "react-native-gesture-handler"

export const SettingsScreen = () => {
    const { LL } = useI18nContext()

    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const { settingsList, supportList } = useMemo(() => getLists(LL, devFeaturesEnabled), [devFeaturesEnabled, LL])

    const { styles: themedStyles } = useThemedStyles(baseStyles)

    const renderItem = useCallback(
        ({ item }: { item: RowProps }) => (
            <SettingsRow title={item.title} screenName={item.screenName} icon={item.icon} url={item.url} />
        ),
        [],
    )

    const flatSettingListRef = useRef(null)
    const flatSupportListRef = useRef(null)

    useScrollToTop(flatSettingListRef)
    const theme = useTheme()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isShowBackupModal = useCheckWalletBackup(selectedAccount)
    const nav = useNavigation()

    const SupportList = useCallback(() => {
        return (
            <BaseView style={[themedStyles.list]}>
                <BaseSpacer height={1} background={theme.colors.placeholder} />
                <FlatList
                    ref={flatSupportListRef}
                    data={supportList}
                    keyExtractor={item => item.screenName}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                />
            </BaseView>
        )
    }, [renderItem, supportList, theme.colors.placeholder, themedStyles.list])

    const renderBackupWarning = useMemo(() => {
        return (
            <BaseCard containerStyle={themedStyles.cardContainer}>
                <BaseView w={100}>
                    <BaseView flexDirection="row">
                        <BaseIcon name="alert" size={24} color={theme.colors.error} />
                        <BaseSpacer width={8} />
                        <BaseText typographyFont="subTitleBold" color={theme.colors.textReversed}>
                            {"Backup Your Wallet"}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={24} />
                    <BaseText color={theme.colors.textReversed}>
                        {"Make sure you can recover your crypto if you lose your device or switch to another wallet."}
                    </BaseText>
                    <BaseSpacer height={36} />
                    <BaseButton title={"Backup Now"} action={() => nav.navigate(Routes.SETTINGS_PRIVACY)} />
                </BaseView>
            </BaseCard>
        )
    }, [nav, theme.colors.error, theme.colors.textReversed, themedStyles.cardContainer])

    return (
        <BaseSafeArea>
            <BaseView flexDirection="row" justifyContent="space-between" mx={24} pb={16}>
                <BaseText typographyFont="largeTitle" testID="settings-screen">
                    {LL.TITLE_SETTINGS()}
                </BaseText>

                <SelectedNetworkViewer />
            </BaseView>

            <BaseView style={[themedStyles.list]}>
                <FlatList
                    ref={flatSettingListRef}
                    data={settingsList}
                    contentContainerStyle={themedStyles.contentContainerStyle}
                    scrollEnabled={isShowBackupModal || isSmallScreen}
                    keyExtractor={item => item.screenName}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                    ListHeaderComponent={isShowBackupModal ? renderBackupWarning : undefined}
                    ListHeaderComponentStyle={themedStyles.headerContainer}
                    ListFooterComponent={<SupportList />}
                />
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        contentContainerStyle: {
            paddingHorizontal: 24,
        },
        separator: {
            backgroundColor: theme.colors.text,
            height: 0.5,
        },
        list: { flex: 1 },
        cardContainer: {
            backgroundColor: theme.colors.danger,
            padding: 8,
        },
        headerContainer: { marginVertical: 12 },
    })

const getLists = (LL: TranslationFunctions, devEnabled: boolean) => {
    const settingsList: RowProps[] = [
        {
            title: LL.TITLE_GENERAL_SETTINGS(),
            screenName: Routes.SETTINGS_GENERAL,
            icon: "cog-outline",
        },
        {
            title: LL.TITLE_MANAGE_WALLET(),
            screenName: Routes.WALLET_MANAGEMENT,
            icon: "wallet-outline",
        },
        {
            title: LL.TITLE_TRANSACTIONS(),
            screenName: Routes.SETTINGS_TRANSACTIONS,
            icon: "currency-usd",
        },
        {
            title: LL.TITLE_NETWORKS(),
            screenName: Routes.SETTINGS_NETWORK,
            icon: "web",
        },
        {
            title: LL.TITLE_CONNECTED_APPS(),
            screenName: Routes.SETTINGS_CONNECTED_APPS,
            icon: "widgets-outline",
        },
        {
            title: LL.TITLE_CONTACTS(),
            screenName: Routes.SETTINGS_CONTACTS,
            icon: "account-multiple-outline",
        },
        {
            title: LL.TITLE_PRIVACY(),
            screenName: Routes.SETTINGS_PRIVACY,
            icon: "shield-check-outline",
        },
    ]

    const supportList: RowProps[] = [
        {
            title: LL.TITLE_GET_SUPPORT(),
            screenName: Routes.SETTINGS_GET_SUPPORT,
            icon: "help-circle-outline",
            url: "https://support.veworld.com",
        },
        {
            title: LL.TITLE_GIVE_FEEDBACK(),
            screenName: Routes.SETTINGS_GIVE_FEEDBACK,
            icon: "message-outline",
            url: "https://forms.office.com/e/Vq1CUJD9Vy",
        },
        {
            title: LL.TITLE_ABOUT(),
            screenName: Routes.SETTINGS_ABOUT,
            icon: "information-outline",
        },
    ]

    if (devEnabled) {
        settingsList.push({
            title: LL.TITLE_ALERTS(),
            screenName: Routes.SETTINGS_ALERTS,
            icon: "bell-outline",
        })
    }

    return { settingsList, supportList }
}
