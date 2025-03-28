import { FlashList, ListRenderItemInfo } from "@shopify/flash-list"
import { default as React, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { resetBrowserState, selectAllDapps, selectVisitedUrls, useAppSelector } from "~Storage/Redux"
import { HistoryItem, HistoryUrlKind, mapHistoryUrls } from "~Utils/HistoryUtils"
import { SearchResultItem } from "./SearchResultItem"

type Props = {
    query: string
}

export const SearchResults = ({ query }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const visitedUrls = useAppSelector(selectVisitedUrls)
    const apps = useAppSelector(selectAllDapps)

    const mappedUrls = useMemo(() => mapHistoryUrls(visitedUrls, apps), [apps, visitedUrls])

    const results = useMemo(() => {
        if (query.trim() === "") return mappedUrls
        const lowerQuery = query.toLowerCase()
        return mappedUrls.filter(url => {
            if (url.type === HistoryUrlKind.DAPP)
                return (
                    url.dapp.name.toLowerCase().includes(lowerQuery) ||
                    url.dapp.desc?.toLowerCase()?.includes(lowerQuery)
                )
            return url.name.toLowerCase().includes(lowerQuery)
        })
    }, [mappedUrls, query])

    const onClear = useCallback(() => {
        resetBrowserState()
    }, [])

    const isQueryEmptyButWithResults = useMemo(
        () => query.trim() === "" && results.length !== 0,
        [query, results.length],
    )

    const isQueryEmptyWithNoResults = useMemo(
        () => query.trim() === "" && results.length === 0,
        [query, results.length],
    )

    const rootStyles = useMemo(() => {
        if (isQueryEmptyWithNoResults) return [styles.rootContainer, styles.rootContainerEmpty]
        return [styles.rootContainer]
    }, [isQueryEmptyWithNoResults, styles.rootContainer, styles.rootContainerEmpty])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={24} />
    }, [])

    const renderItem = useCallback(({ item }: ListRenderItemInfo<HistoryItem>) => {
        return <SearchResultItem item={item} />
    }, [])

    return (
        <Animated.ScrollView contentContainerStyle={rootStyles}>
            {isQueryEmptyButWithResults && (
                <BaseView justifyContent="space-between" flexDirection="row" alignItems="center">
                    <BaseText typographyFont="bodyMedium">{LL.BROWSER_HISTORY_DEFAULT_TITLE()}</BaseText>
                    <BaseButton
                        action={onClear}
                        rightIcon={<BaseIcon size={12} name="icon-retry" style={styles.clearIcon} />}
                        variant="ghost"
                        px={0}>
                        {LL.BROWSER_HISTORY_CLEAR()}
                    </BaseButton>
                </BaseView>
            )}

            {isQueryEmptyWithNoResults ? (
                <BaseView alignItems="center" justifyContent="center" flexGrow={1}>
                    <BaseView style={styles.noHistoryContainer}>
                        <BaseIcon
                            name="icon-history"
                            style={styles.noHistoryIcon}
                            size={32}
                            color={theme.colors.emptyStateIcon.foreground}
                        />
                        <BaseText>{LL.BROWSER_HISTORY_EMPTY()}</BaseText>
                    </BaseView>
                </BaseView>
            ) : (
                <FlashList
                    renderItem={renderItem}
                    keyExtractor={item => (item.type === HistoryUrlKind.DAPP ? item.dapp.href : item.url)}
                    ItemSeparatorComponent={renderItemSeparator}
                    contentContainerStyle={styles.flatListPadding}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    data={results}
                    estimatedItemSize={80}
                />
            )}
        </Animated.ScrollView>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        rootContainer: {
            flexGrow: 1,
            paddingHorizontal: 24,
        },
        rootContainerEmpty: {
            justifyContent: "center",
        },
        clearIcon: {
            marginLeft: 4,
        },
        noHistoryContainer: {
            gap: 24,
            flexDirection: "column",
        },
        noHistoryIcon: {
            borderRadius: 999,
            padding: 16,
            backgroundColor: theme.colors.emptyStateIcon.background,
            alignSelf: "center",
        },
        flatListPadding: { paddingBottom: 24 },
    })
}
