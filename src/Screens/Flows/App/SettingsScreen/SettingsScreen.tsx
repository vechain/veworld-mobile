import React, { useCallback, useMemo, useState } from "react"
import { BaseSafeArea, BaseSpacer, BaseText } from "~Components"
import { TranslationFunctions, useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { FlashList } from "@shopify/flash-list"
import { View, ViewToken } from "react-native"
import { RowProps, SettingsRow } from "./Components/SettingsRow"

export const SettingsScreen = () => {
    const { LL } = useI18nContext()

    const SCREEN_LIST = useMemo(() => getList(LL), [LL])

    const [isScrollable, setIsScrollable] = useState(false)

    const Seperator = useCallback(
        () => (
            <View
                style={{
                    borderBottomColor: "rgba(0,0,0,0.1)",
                    borderBottomWidth: 1,
                }}
            />
        ),
        [],
    )

    const checkViewableItems = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length < SCREEN_LIST.length) {
                setIsScrollable(true)
            } else {
                setIsScrollable(false)
            }
        },
        [SCREEN_LIST.length],
    )

    const _renderItem = useCallback(
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
        // <BaseSafeArea>
        //     <BaseView align="center" justify="center" mx={20}>
        //         <BaseText>Settings Screen</BaseText>
        //         <BaseSpacer height={40} />
        //         <SecureApp />
        //         <BaseSpacer height={20} />
        //         <EnableBiometrics />
        //         <BaseSpacer height={20} />
        //         <ChangeTheme />
        //         <BaseSpacer height={50} />
        //         <BaseSpacer height={60} />
        //         <Reset />
        //     </BaseView>
        // </BaseSafeArea>

        <BaseSafeArea grow={1}>
            <BaseText typographyFont="largeTitle" mx={20}>
                {LL.TITLE_SETTINGS()}
            </BaseText>

            <BaseSpacer height={20} />

            <FlashList
                data={SCREEN_LIST}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                ItemSeparatorComponent={Seperator}
                estimatedItemSize={56}
                scrollEnabled={isScrollable}
                keyExtractor={item => item.screenName}
                onViewableItemsChanged={checkViewableItems}
                renderItem={_renderItem}
            />

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}

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
        screenName: Routes.SETTINGS_MANAGE_WALLET,
        icon: "wallet-outline",
    },
    {
        title: LL.TITLE_NFT(),
        screenName: Routes.SETTINGS_NFT,
        icon: "image-multiple-outline",
    },
    {
        title: LL.TITLE_NETWORK(),
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
