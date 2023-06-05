import React, { useCallback, useMemo } from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { TranslationFunctions, useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { FlashList } from "@shopify/flash-list"
import { StyleSheet, View } from "react-native"
import { RowProps, SettingsRow } from "./Components/SettingsRow"
import { ColorThemeType, useScrollableList, useThemedStyles } from "~Common"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

export const SettingsScreen = () => {
    const { LL } = useI18nContext()

    const SCREEN_LIST = useMemo(() => getList(LL), [LL])

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(SCREEN_LIST, 1, 2) // 1 and 2 are to simulate snapIndex fully expanded.

    const { styles: themedStyles } = useThemedStyles(baseStyles)

    const insets = useSafeAreaInsets()

    const tabBarHeight = useBottomTabBarHeight()

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
        <BaseSafeArea grow={1}>
            <BaseText
                typographyFont="largeTitle"
                mx={20}
                testID="settings-screen">
                {LL.TITLE_SETTINGS()}
            </BaseText>

            <BaseSpacer height={20} />

            <BaseView
                flexDirection="row"
                style={[
                    themedStyles.list,
                    { paddingBottom: tabBarHeight - insets.bottom },
                ]}>
                <FlashList
                    data={SCREEN_LIST}
                    contentContainerStyle={themedStyles.contentContainerStyle}
                    ItemSeparatorComponent={renderSeparator}
                    scrollEnabled={isListScrollable}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
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
            paddingHorizontal: 20,
        },
        separator: {
            borderBottomColor: theme.colors.text,
            borderBottomWidth: 0.5,
        },
        list: { flex: 1 },
    })

const getList = (LL: TranslationFunctions) => [
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
        title: LL.TITLE_ALERTS(),
        screenName: Routes.SETTINGS_ALERTS,
        icon: "bell-outline",
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
