import React, { useCallback, useMemo } from "react"
import { BaseFlashList, BaseSafeArea, BaseText, BaseView } from "~Components"
import { TranslationFunctions, useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { StyleSheet, View } from "react-native"
import { RowProps, SettingsRow } from "./Components/SettingsRow"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType, isSmallScreen } from "~Constants"
import { selectAreDevFeaturesEnabled, useAppSelector } from "~Storage/Redux"

export const SettingsScreen = () => {
    const { LL } = useI18nContext()

    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const SCREEN_LIST = useMemo(
        () => getList(LL, devFeaturesEnabled),
        [devFeaturesEnabled, LL],
    )

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
        <BaseSafeArea>
            <BaseText
                mx={24}
                typographyFont="largeTitle"
                testID="settings-screen"
                pb={16}>
                {LL.TITLE_SETTINGS()}
            </BaseText>

            <BaseView flexDirection="row" style={[themedStyles.list]}>
                <BaseFlashList
                    data={SCREEN_LIST}
                    contentContainerStyle={themedStyles.contentContainerStyle}
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
    })

const getList = (LL: TranslationFunctions, devEnabled: boolean) => {
    const settingsList: RowProps[] = [
        {
            title: LL.TITLE_GENERAL(),
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

    if (devEnabled) {
        settingsList.push({
            title: LL.TITLE_ALERTS(),
            screenName: Routes.SETTINGS_ALERTS,
            icon: "bell-outline",
        })
    }

    return settingsList
}
