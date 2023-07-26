import React, { useCallback, useMemo } from "react"
import { BaseText, BaseView, Layout } from "~Components"
import { TranslationFunctions, useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { FlashList } from "@shopify/flash-list"
import { StyleSheet, View } from "react-native"
import { RowProps, SettingsRow } from "./Components/SettingsRow"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType, isSmallScreen } from "~Constants"
import { DEV_FEATURES } from "../../../../../index"

export const SettingsScreen = () => {
    const { LL } = useI18nContext()

    const SCREEN_LIST = useMemo(() => getList(LL), [LL])

    const { styles: themedStyles } = useThemedStyles(baseStyles)

    const renderSeparator = useCallback(
        () => <View style={themedStyles.separator} />,
        [themedStyles],
    )

    const renderItem = useCallback(
        ({ item }: { item: RowProps }) => (
            <SettingsRow
                title={item.title}
                screenName={item.screenName}
                icon={item.icon}
            />
        ),
        [],
    )

    return (
        <Layout
            safeAreaTestID="SettingsScreen"
            fixedHeader={
                <BaseText
                    typographyFont="largeTitle"
                    testID="settings-screen"
                    pb={16}>
                    {LL.TITLE_SETTINGS()}
                </BaseText>
            }
            bodyWithoutScrollView={
                <BaseView flexDirection="row" style={[themedStyles.list]}>
                    <FlashList
                        data={SCREEN_LIST}
                        contentContainerStyle={
                            themedStyles.contentContainerStyle
                        }
                        ItemSeparatorComponent={renderSeparator}
                        scrollEnabled={isSmallScreen}
                        keyExtractor={item => item.screenName}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        renderItem={renderItem}
                        estimatedItemSize={56}
                        estimatedListSize={{
                            height: 56 * SCREEN_LIST.length,
                            width: 400,
                        }}
                    />
                </BaseView>
            }
            noBackButton
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        contentContainerStyle: {
            paddingHorizontal: 24,
        },
        separator: {
            borderBottomColor: theme.colors.text,
            borderBottomWidth: 0.5,
        },
        list: { flex: 1 },
    })

const getList = (LL: TranslationFunctions) => {
    const settingsList = [
        {
            title: LL.TITLE_GENERAL(),
            screenName: Routes.SETTINGS_GENERAL,
            icon: "cog-outline",
        },
        {
            title: LL.TITLE_ADVANCED(),
            screenName: Routes.SETTINGS_ADVANCED,
            icon: "format-list-bulleted",
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
            title: LL.TITLE_CONTACTS(),
            screenName: Routes.SETTINGS_CONTACTS,
            icon: "book-outline",
        },
        {
            title: LL.TITLE_PRIVACY(),
            screenName: Routes.SETTINGS_PRIVACY,
            icon: "shield-check-outline",
        },

        {
            title: LL.TITLE_CONNECTED_APPS(),
            screenName: Routes.SETTINGS_CONNECTED_APPS,
            icon: "widgets-outline",
        },
        {
            title: LL.TITLE_ABOUT(),
            screenName: Routes.SETTINGS_ABOUT,
            icon: "information-outline",
        },
    ]

    if (DEV_FEATURES) {
        settingsList.push({
            title: LL.TITLE_ALERTS(),
            screenName: Routes.SETTINGS_ALERTS,
            icon: "bell-outline",
        })
    }

    return settingsList
}
