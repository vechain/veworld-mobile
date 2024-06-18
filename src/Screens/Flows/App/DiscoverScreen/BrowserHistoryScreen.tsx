import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { ImageSourcePropType, StyleSheet } from "react-native"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { BaseSearchInput, BaseSpacer, BaseText, BaseView, Layout, SwipeableRow } from "~Components"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useThemedStyles, useVisitedUrls } from "~Hooks"
import { RumManager } from "~Logging"
import { Routes } from "~Navigation"
import { addNavigationToDApp, selectVisitedUrls, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { DAppIcon } from "./Components/DAppIcon"
import { EmptyResults } from "./Components/EmptyResults"
import { getAppHubIconUrl } from "./utils"

type BrowserHistoryCardProps = {
    dapp: DiscoveryDApp
    onLinkPress: ({ href }: { href: string }) => void
    onTrashIconPress: (dapp: DiscoveryDApp) => void
}

const BrowserHistoryCard = ({ dapp, onLinkPress, onTrashIconPress }: BrowserHistoryCardProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const imageUri: ImageSourcePropType = {
        uri: dapp.id ? getAppHubIconUrl(dapp.id) : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`,
    }

    return (
        <SwipeableRow
            swipeableItemRefs={swipeableItemRefs}
            item={dapp}
            itemKey={dapp.href}
            handleTrashIconPress={() => onTrashIconPress(dapp)}
            onPress={() => onLinkPress({ href: dapp.href })}>
            <BaseView flexDirection="row" alignItems="center" p={12}>
                <DAppIcon imageSource={imageUri} />
                <BaseSpacer width={12} />
                <BaseView flex={1}>
                    <BaseText ellipsizeMode="tail" numberOfLines={1} style={styles.nameText}>
                        {dapp.name}
                    </BaseText>
                    <BaseSpacer height={4} />
                    <BaseText ellipsizeMode="tail" numberOfLines={1} style={styles.description}>
                        {dapp.href}
                    </BaseText>
                </BaseView>
            </BaseView>
        </SwipeableRow>
    )
}

export const BrowserHistoryScreen = () => {
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const ddLogger = useMemo(() => new RumManager(), [])
    const { addVisitedUrl, removeVisitedUrl } = useVisitedUrls()

    const [filteredSearch, setFilteredSearch] = useState("")

    const visitedUrls = useAppSelector(selectVisitedUrls)

    const visitedUrlsToShow = useMemo(() => {
        const urls = [...visitedUrls].reverse()
        const lowerCasedFilteredSearch = filteredSearch.toLocaleLowerCase()

        return filteredSearch.length > 0
            ? urls.filter(
                  url =>
                      url.name.toLocaleLowerCase().includes(lowerCasedFilteredSearch) ||
                      url.href.toLocaleLowerCase().includes(lowerCasedFilteredSearch),
              )
            : urls
    }, [filteredSearch, visitedUrls])

    const onTextChange = useCallback((text: string) => {
        setFilteredSearch(text)
    }, [])

    const onLinkPress = useCallback(
        ({ href, custom }: { href: string; custom?: boolean }) => {
            nav.navigate(Routes.BROWSER, { url: href })

            addVisitedUrl(href)

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: href,
            })

            ddLogger.logAction("DISCOVERY_SECTION", "DISCOVERY_USER_OPENED_DAPP")

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: custom ?? false }))
            }, 1000)
        },
        [nav, addVisitedUrl, track, ddLogger, dispatch],
    )

    const onTrashIconPress = useCallback(
        (dapp: DiscoveryDApp) => {
            removeVisitedUrl(dapp)
        },
        [removeVisitedUrl],
    )

    return (
        <Layout
            hasSafeArea={true}
            hasTopSafeAreaOnly={false}
            fixedHeader={
                <>
                    <BaseText typographyFont="title">{LL.BROWSER_HISTORY_TITLE()}</BaseText>
                    <BaseSpacer height={12} />
                    <BaseSearchInput
                        placeholder={LL.BROWSER_HISTORY_SEARCH_PLACEHOLDER()}
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
                <BaseView flex={1}>
                    <FlashList
                        contentContainerStyle={styles.listContentContainer}
                        data={visitedUrlsToShow}
                        keyExtractor={item => item.href}
                        renderItem={({ item }) => (
                            <BrowserHistoryCard
                                dapp={item}
                                onLinkPress={onLinkPress}
                                onTrashIconPress={onTrashIconPress}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyResults subtitle={LL.BROWSER_HISTORY_No_RECORDS()} icon={"search-web"} />
                        }
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listContentContainer: {
            paddingTop: 12,
        },
        icon: {
            height: 40,
            width: 40,
            borderRadius: 20,
            objectFit: "cover",
        },
        nameText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        description: {
            fontSize: 12,
        },
    })
