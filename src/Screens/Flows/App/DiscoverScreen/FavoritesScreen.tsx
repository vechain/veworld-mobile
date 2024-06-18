import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useMemo, useState } from "react"
import { FlatList, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { BaseIcon, BaseSearchInput, BaseSpacer, BaseText, BaseTouchableBox, BaseView, Layout } from "~Components"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useDappBookmarking, useThemedStyles } from "~Hooks"
import { RumManager } from "~Logging"
import { Routes } from "~Navigation"
import { addNavigationToDApp, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { DAppIcon } from "./Components/DAppIcon"
import { EmptyResults } from "./Components/EmptyResults"
import { getAppHubIconUrl } from "./utils"

type Props = {
    dapp: DiscoveryDApp
    onDAppPress: ({ href }: { href: string; custom?: boolean }) => void
    containerStyle?: StyleProp<ViewStyle>
}

export const DAppCard: React.FC<Props> = memo(({ onDAppPress, dapp, containerStyle }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const { isBookMarked, toggleBookmark } = useDappBookmarking(dapp.href, dapp?.name)

    const onPressCard = useCallback(() => {
        onDAppPress({ href: dapp.href })
    }, [dapp.href, onDAppPress])

    return (
        <BaseView w={100} flexDirection="row" style={containerStyle}>
            <BaseTouchableBox
                haptics="Light"
                action={onPressCard}
                justifyContent="space-between"
                containerStyle={styles.container}>
                <BaseView flexDirection="row" style={styles.card} flex={1} pr={10}>
                    <DAppIcon
                        imageSource={{
                            uri: dapp.id
                                ? getAppHubIconUrl(dapp.id)
                                : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`,
                        }}
                    />
                    <BaseSpacer width={12} />
                    <BaseView flex={1}>
                        <BaseText ellipsizeMode="tail" numberOfLines={1} style={styles.nameText}>
                            {dapp.name}
                        </BaseText>
                        <BaseSpacer height={4} />
                        <BaseText ellipsizeMode="tail" numberOfLines={2} style={styles.description}>
                            {dapp.desc ? dapp.desc : dapp.href}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseTouchableBox>
            <BaseSpacer width={12} />
            <BaseIcon
                onPress={toggleBookmark}
                name={isBookMarked ? "bookmark" : "bookmark-outline"}
                color={theme.colors.text}
                size={24}
            />
        </BaseView>
    )
})

export const FavouritesScreen = () => {
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const ddLogger = useMemo(() => new RumManager(), [])

    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)

    const [filteredSearch, setFilteredSearch] = useState("")

    const renderSeparator = useCallback(() => <BaseSpacer height={12} />, [])
    const renderFooter = useCallback(() => <BaseSpacer height={24} />, [])

    const onTextChange = useCallback((text: string) => {
        setFilteredSearch(text)
    }, [])

    const onDAppPress = useCallback(
        ({ href, custom }: { href: string; custom?: boolean }) => {
            nav.navigate(Routes.BROWSER, { url: href })

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: href,
            })

            ddLogger.logAction("DISCOVERY_SECTION", "DISCOVERY_USER_OPENED_DAPP")

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: custom ?? false }))
            }, 1000)
        },
        [track, dispatch, nav, ddLogger],
    )

    const dappToShow = useMemo(() => {
        if (filteredSearch === "") {
            return bookmarkedDApps
        }

        return bookmarkedDApps.filter(dapp => dapp.name.toLowerCase().includes(filteredSearch.toLowerCase()))
    }, [bookmarkedDApps, filteredSearch])

    return (
        <Layout
            hasSafeArea={true}
            hasTopSafeAreaOnly={false}
            fixedHeader={
                <>
                    <BaseText typographyFont="title">{LL.FAVOURITES_DAPPS_TITLE()}</BaseText>
                    <BaseSpacer height={12} />
                    <BaseSearchInput
                        placeholder={LL.FAVOURITES_DAPPS_SEARCH_PLACEHOLDER()}
                        setValue={onTextChange}
                        value={filteredSearch}
                        showIcon={filteredSearch.length > 0}
                        iconName="close"
                        iconSize={18}
                        onIconPress={() => setFilteredSearch("")}
                    />
                </>
            }
            fixedBody={
                <BaseView flex={1} px={24}>
                    <FlatList
                        contentContainerStyle={styles.listContentContainer}
                        data={dappToShow}
                        keyExtractor={item => item.href}
                        renderItem={({ item }) => <DAppCard dapp={item} onDAppPress={onDAppPress} />}
                        ListFooterComponent={renderFooter}
                        ItemSeparatorComponent={renderSeparator}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyResults subtitle={LL.FAVOURITES_DAPPS_NO_RECORDS()} icon={"search-web"} />
                        }
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        card: {
            height: 60,
        },
        nameText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        description: {
            fontSize: 12,
        },
        listContentContainer: {
            flexGrow: 1,
            paddingTop: 12,
        },
    })
