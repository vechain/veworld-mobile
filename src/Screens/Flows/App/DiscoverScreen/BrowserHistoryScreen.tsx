import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import React, { MutableRefObject, useCallback, useMemo, useRef, useState } from "react"
import { ImageSourcePropType, StyleSheet } from "react-native"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import {
    BaseSearchInput,
    BaseSpacer,
    BaseText,
    BaseView,
    DAppIcon,
    Layout,
    ListEmptyResults,
    SwipeableRow,
} from "~Components"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useThemedStyles, useVisitedUrls } from "~Hooks"
import { Routes } from "~Navigation"
import { addNavigationToDApp, selectVisitedUrls, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { DAppUtils } from "~Utils"
import { useI18nContext } from "~i18n"

type BrowserHistoryCardProps = {
    dapp: DiscoveryDApp
    onLinkPress: ({ href }: { href: string }) => void
    onTrashIconPress: (dapp: DiscoveryDApp) => void
    swipeableItemRefs: MutableRefObject<Map<string, SwipeableItemImperativeRef>>
}

const BrowserHistoryCard = ({ dapp, swipeableItemRefs, onLinkPress, onTrashIconPress }: BrowserHistoryCardProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const [selectedItem, setSelectedItem] = useState<DiscoveryDApp | undefined>(undefined)

    const imageUri: ImageSourcePropType = {
        uri: dapp.id ? DAppUtils.getAppHubIconUrl(dapp.id) : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`,
    }

    const clickEnabled = selectedItem === undefined

    const onPressHandler = () => {
        clickEnabled && onLinkPress({ href: dapp.href })
    }

    return (
        <SwipeableRow
            swipeableItemRefs={swipeableItemRefs}
            item={dapp}
            itemKey={dapp.href}
            setSelectedItem={setSelectedItem}
            handleTrashIconPress={() => onTrashIconPress(dapp)}
            onPress={onPressHandler}>
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

const ListEmptyComponent = () => {
    const { LL } = useI18nContext()

    return (
        <BaseView flex={1} justifyContent="center" alignItems="center">
            <ListEmptyResults subtitle={LL.BROWSER_HISTORY_No_RECORDS()} icon={"icon-search"} />
        </BaseView>
    )
}

export const BrowserHistoryScreen = () => {
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const { addVisitedUrl, removeVisitedUrl } = useVisitedUrls()
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

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

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: custom ?? false }))
            }, 1000)
        },
        [nav, addVisitedUrl, track, dispatch],
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
                        iconName="icon-x"
                        iconSize={18}
                        onIconPress={() => setFilteredSearch("")}
                    />
                </>
            }
            fixedBody={
                <BaseView flex={1}>
                    {visitedUrlsToShow.length > 0 ? (
                        <FlashList
                            contentContainerStyle={styles.listContentContainer}
                            data={visitedUrlsToShow}
                            keyExtractor={item => item.href}
                            renderItem={({ item }) => (
                                <BrowserHistoryCard
                                    swipeableItemRefs={swipeableItemRefs}
                                    dapp={item}
                                    onLinkPress={onLinkPress}
                                    onTrashIconPress={onTrashIconPress}
                                />
                            )}
                            estimatedItemSize={80}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <ListEmptyComponent />
                    )}
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
